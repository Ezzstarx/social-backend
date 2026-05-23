const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Comment = require("../models/Comment");
const Share = require("../models/Share");
const Reaction = require("../models/Reaction");
const GistTopic = require("../models/GistTopic");
const MangaEpisode = require("../models/MangaEpisode");
const Chapter = require("../models/chapter");
const User = require("../models/User");
const requireAuth = require("../middleware/requireAuth");
const abuseDetector = require("../services/abuseDetector");
const viewTracker = require("../services/viewTracker");
const xpEngine = require("../services/xpEngine");
const rewardEngine = require("../services/rewardEngine");

async function getContentOwnerId(contentType, contentId) {
  if (contentType === "MANGA_CHAPTER") {
    const episode = await MangaEpisode.findById(contentId).populate("manga");
    return episode?.manga?.author;
  } else if (contentType === "STORY_PART") {
    const chapterDoc = await Chapter.findById(contentId).populate("story");
    return chapterDoc?.story?.author;
  } else if (contentType === "GIST_TOPIC") {
    const topic = await GistTopic.findById(contentId);
    return topic?.creatorId;
  }
  return null;
}

async function incrementCommentCount(contentType, contentId) {
  if (contentType === "GIST_TOPIC") {
    await GistTopic.findByIdAndUpdate(contentId, { $inc: { commentCount: 1 } });
  } else if (contentType === "MANGA_CHAPTER") {
    await MangaEpisode.findByIdAndUpdate(contentId, { $inc: { commentsCount: 1 } });
  } else if (contentType === "STORY_PART") {
    await Chapter.findByIdAndUpdate(contentId, { $inc: { commentsCount: 1 } });
  }
}

async function incrementShareCount(contentType, contentId) {
  if (contentType === "GIST_TOPIC") {
    await GistTopic.findByIdAndUpdate(contentId, { $inc: { shareCount: 1 } });
  }
}

async function checkAndProcessGistMilestone(contentId) {
  const topic = await GistTopic.findById(contentId);
  if (!topic) return;
  if (topic.qualifiedViewCount >= 1000 && topic.commentCount >= 100 && topic.shareCount >= 15) {
    if (topic.lastRewardedMilestone === 0) {
      topic.lastRewardedMilestone = 1;
      await topic.save();
      await rewardEngine.processGistActivityReward(topic.creatorId, topic._id.toString());
    }
  }
}

// Handler functions for clean dispatcher
const recordViewHandler = async (req, res) => {
  try {
    const { contentType, contentId, durationSeconds, isBoosted, deviceHash } = req.body;
    let viewerUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const jwt = require("jsonwebtoken");
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
        viewerUserId = decoded.id;
      } catch (e) {
        // Ignore
      }
    }

    const ip = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

    const ownerId = await getContentOwnerId(contentType, contentId);
    const abuse = abuseDetector.checkViewAbuse(viewerUserId, ownerId, ipHash, deviceHash, contentType, contentId);
    if (abuse.isAbuse) {
      return res.status(200).json({ qualified: false, reason: abuse.reason, viewCount: 0 });
    }

    const result = await viewTracker.recordView(
      contentType,
      contentId,
      viewerUserId,
      ipHash,
      deviceHash || "unknown_device",
      durationSeconds,
      isBoosted
    );

    return res.status(200).json({ success: true, qualified: result.qualified, viewCount: result.viewCount });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const createCommentHandler = async (req, res) => {
  try {
    const { contentType, contentId, body } = req.body;
    const userId = req.user._id;

    const abuse = abuseDetector.checkCommentAbuse(userId, body);
    if (abuse.isAbuse) {
      const comment = await Comment.create({
        authorId: userId,
        contentType,
        contentId,
        body,
        isSpam: true,
      });
      return res.status(200).json({ success: false, isSpam: true, comment, reason: abuse.reason });
    }

    const comment = await Comment.create({
      authorId: userId,
      contentType,
      contentId,
      body,
      isSpam: false,
    });

    await incrementCommentCount(contentType, contentId);
    await xpEngine.awardXP(userId, "COMMENT", contentId);

    if (contentType === "GIST_TOPIC") {
      await checkAndProcessGistMilestone(contentId);
    }

    return res.status(201).json({ success: true, comment });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getCommentsHandler = async (req, res) => {
  try {
    const { contentType, contentId } = req.params;
    const comments = await Comment.find({ contentType, contentId, isSpam: false })
      .populate("authorId", "username displayName profilePic")
      .sort({ createdAt: 1 });
    return res.status(200).json({ success: true, comments });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const createShareHandler = async (req, res) => {
  try {
    const { contentType, contentId } = req.body;
    const userId = req.user._id;

    const existing = await Share.findOne({ userId, contentType, contentId });
    if (existing) {
      return res.status(400).json({ error: "You have already shared this content" });
    }

    const share = await Share.create({
      userId,
      contentType,
      contentId,
    });

    await incrementShareCount(contentType, contentId);
    await xpEngine.awardXP(userId, "SHARE", contentId);

    if (contentType === "GIST_TOPIC") {
      await checkAndProcessGistMilestone(contentId);
    }

    return res.status(201).json({ success: true, share });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const createReactionHandler = async (req, res) => {
  try {
    const { contentType, contentId, reactionType } = req.body;
    const userId = req.user._id;

    if (!["LIKE", "LOVE", "FIRE", "WOW"].includes(reactionType)) {
      return res.status(400).json({ error: "Invalid reaction type" });
    }

    const existing = await Reaction.findOne({ userId, contentType, contentId });
    if (existing) {
      if (existing.reactionType === reactionType) {
        await Reaction.deleteOne({ _id: existing._id });
        return res.status(200).json({ success: true, action: "REMOVED", reaction: null });
      } else {
        existing.reactionType = reactionType;
        await existing.save();
        return res.status(200).json({ success: true, action: "UPDATED", reaction: existing });
      }
    } else {
      const reaction = await Reaction.create({ userId, contentType, contentId, reactionType });
      return res.status(201).json({ success: true, action: "CREATED", reaction });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// 🔹 ROUTE DISPATCHERS 🔹

// POST /api/views/record
router.post("/record", recordViewHandler);

// Dispatcher for POST base routes: /api/comments, /api/shares, /api/reactions
router.post("/", requireAuth, async (req, res, next) => {
  if (req.baseUrl.endsWith("/comments")) {
    return createCommentHandler(req, res, next);
  } else if (req.baseUrl.endsWith("/shares")) {
    return createShareHandler(req, res, next);
  } else if (req.baseUrl.endsWith("/reactions")) {
    return createReactionHandler(req, res, next);
  }
  return res.status(404).json({ error: "Endpoint not found" });
});

// Dispatcher for GET comments: /api/comments/:contentType/:contentId
router.get("/:contentType/:contentId", async (req, res, next) => {
  if (req.baseUrl.endsWith("/comments")) {
    return getCommentsHandler(req, res, next);
  }
  return res.status(404).json({ error: "Endpoint not found" });
});

module.exports = router;
