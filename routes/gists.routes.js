const express = require("express");
const router = express.Router();
const Gist = require("../models/Gist");
const GistTopic = require("../models/GistTopic");
const Comment = require("../models/Comment");
const requireAuth = require("../middleware/requireAuth");
const requireOnboarding = require("../middleware/requireOnboarding");

// POST /api/gists
router.post("/", requireAuth, requireOnboarding, async (req, res) => {
  try {
    const { name, description, coverUrl } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Gist name is required" });
    }
    const gist = await Gist.create({
      creatorId: req.user._id,
      name,
      description,
      coverUrl,
    });
    return res.status(201).json({ success: true, gist });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/gists
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: "i" };
    }

    const gists = await Gist.find(query)
      .populate("creatorId", "username displayName profilePic")
      .skip(skip)
      .limit(limit);

    const total = await Gist.countDocuments(query);

    return res.status(200).json({
      success: true,
      gists,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/gists/:id
router.get("/:id", async (req, res) => {
  try {
    const gist = await Gist.findById(req.params.id).populate("creatorId", "username displayName profilePic");
    if (!gist) {
      return res.status(404).json({ error: "Gist not found" });
    }
    const topics = await GistTopic.find({ gistId: gist._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, gist, topics });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/gists/:id/topics
router.post("/:id/topics", requireAuth, async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: "Title and body are required" });
    }
    const gist = await Gist.findById(req.params.id);
    if (!gist) {
      return res.status(404).json({ error: "Gist not found" });
    }

    const topic = await GistTopic.create({
      gistId: gist._id,
      creatorId: req.user._id,
      title,
      body,
    });

    return res.status(201).json({ success: true, topic });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/gists/:id/topics
router.get("/:id/topics", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { gistId: req.params.id };
    const topics = await GistTopic.find(query)
      .populate("creatorId", "username displayName profilePic")
      .sort({ qualifiedViewCount: -1 })
      .skip(skip)
      .limit(limit);

    const total = await GistTopic.countDocuments(query);

    return res.status(200).json({
      success: true,
      topics,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/gists/topics/:topicId
router.get("/topics/:topicId", async (req, res) => {
  try {
    const topic = await GistTopic.findById(req.params.topicId).populate("creatorId", "username displayName profilePic");
    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }
    const commentCount = await Comment.countDocuments({ contentType: "GIST_TOPIC", contentId: topic._id.toString() });
    return res.status(200).json({ success: true, topic, commentCount });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
