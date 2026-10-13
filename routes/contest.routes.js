const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Contest = require("../models/Contest");
const Notification = require("../models/Notification");
const requireAuth = require("../middleware/requireAuth");
const xpEngine = require("../services/xpEngine");
const rewardEngine = require("../services/rewardEngine");
const { notifyUser } = require("../services/socket");

// ─────────────────────────────────────────────
// POST /api/contests
// Create a new contest (requireAuth)
// ─────────────────────────────────────────────
router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      name, description, bannerImage, type, entryFee,
      votingMethod, maxParticipants, startDate, endDate, tags,
    } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: "name and type are required" });
    }

    const VALID_TYPES = ["MANGA_DRAWING", "STORY_WRITING", "COSPLAY", "GAMING", "FAN_ART", "COMMUNITY"];
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: `type must be one of: ${VALID_TYPES.join(", ")}` });
    }

    const contest = await Contest.create({
      name,
      description,
      bannerImage,
      type,
      createdBy: req.user._id,
      entryFee: entryFee || 0,
      votingMethod: votingMethod || "COMMUNITY",
      maxParticipants: maxParticipants || 100,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      tags: tags || [],
    });

    return res.status(201).json({ success: true, contest });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/contests
// List contests with optional filters
// ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.type) query.type = req.query.type;

    const contests = await Contest.find(query)
      .populate("createdBy", "username displayName profilePic")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Attach submission count to each contest (avoid sending full submission arrays)
    const contestsWithCount = contests.map(c => ({
      ...c,
      submissionCount: c.submissions ? c.submissions.length : 0,
      submissions: undefined, // don't expose full submission list in index
    }));

    const total = await Contest.countDocuments(query);

    return res.status(200).json({
      success: true,
      contests: contestsWithCount,
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

// ─────────────────────────────────────────────
// GET /api/contests/:id
// Get contest details with submissions
// ─────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate("createdBy", "username displayName profilePic")
      .populate("submissions.userId", "username displayName profilePic");

    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    return res.status(200).json({ success: true, contest });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/contests/:id/submit
// Submit an entry to a contest (requireAuth)
// Deducts entry fee if applicable (blueprint §21 split)
// Awards JOIN_EVENT XP (10 XP) or REGISTER_EVENT XP (25 XP) for paid
// ─────────────────────────────────────────────
router.post("/:id/submit", requireAuth, async (req, res) => {
  try {
    const { contentUrl, description } = req.body;
    const userId = req.user._id;

    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    if (contest.status !== "ACTIVE" && contest.status !== "UPCOMING") {
      return res.status(400).json({ error: "Contest is not accepting submissions" });
    }

    // Prevent duplicate submissions
    const alreadySubmitted = contest.submissions.some(
      s => s.userId.toString() === userId.toString()
    );
    if (alreadySubmitted) {
      return res.status(400).json({ error: "You have already submitted an entry" });
    }

    if (contest.submissions.length >= contest.maxParticipants) {
      return res.status(400).json({ error: "Contest has reached max participants" });
    }

    // Handle entry fee (blueprint §21: 80% prize pool, 15% host, 5% platform)
    let feeSplitResult = null;
    if (contest.entryFee && contest.entryFee > 0) {
      // Use the same event entry fee split logic
      // Temporarily add createdBy as the "host" for the split calculation
      const fakeEventId = contest._id; // reference the contest as the event
      await rewardEngine.debitWallet(
        userId,
        contest.entryFee,
        "EVENT_ENTRY",
        contest._id.toString(),
        "Contest",
        `Entry fee for contest: ${contest.name}`
      );

      const prizePoolShare = contest.entryFee * 0.80;
      const hostShare = contest.entryFee * 0.15;

      contest.prizePool = (contest.prizePool || 0) + prizePoolShare;

      // Credit host
      if (mongoose.Types.ObjectId.isValid(contest.createdBy)) {
        await rewardEngine.creditWallet(
          contest.createdBy,
          hostShare,
          "EVENT_HOST_EARN",
          contest._id.toString(),
          "Contest",
          `Host earnings from contest registration`
        );
      }

      feeSplitResult = {
        prizePoolShare,
        hostShare,
        platformShare: contest.entryFee * 0.05,
      };

      // Award REGISTER_EVENT XP (25 XP) for paid entry
      await xpEngine.awardXP(userId, "REGISTER_EVENT", contest._id.toString());
    } else {
      // Award JOIN_EVENT XP (10 XP) for free entry
      await xpEngine.awardXP(userId, "JOIN_EVENT", contest._id.toString());
    }

    // Add submission
    contest.submissions.push({
      userId,
      contentUrl: contentUrl || "",
      description: description || "",
      voteCount: 0,
      judgeScore: 0,
    });

    await contest.save();

    // Send notification (blueprint §26: "Contest joined")
    const notif = await Notification.create({
      userId,
      type: "CONTEST_JOINED",
      title: "Contest Entry Submitted!",
      body: `Your entry for "${contest.name}" has been submitted. Good luck!`,
      referenceId: contest._id.toString(),
      referenceType: "Contest",
    });
    notifyUser(userId, notif);

    return res.status(201).json({
      success: true,
      message: "Entry submitted successfully",
      feeSplit: feeSplitResult,
      submissionCount: contest.submissions.length,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/contests/:id/vote/:submissionId
// Community vote on a submission (requireAuth)
// Blueprint §20: "Community voting" method
// ─────────────────────────────────────────────
router.post("/:id/vote/:submissionId", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    if (contest.votingMethod === "HOST") {
      return res.status(403).json({ error: "This contest uses host judging only — community voting is disabled" });
    }

    if (contest.status !== "ACTIVE" && contest.status !== "JUDGING") {
      return res.status(400).json({ error: "Voting is not currently open for this contest" });
    }

    const submission = contest.submissions.id(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // Prevent self-voting
    if (submission.userId.toString() === userId.toString()) {
      return res.status(400).json({ error: "You cannot vote for your own submission" });
    }

    // Prevent double voting
    if (submission.voters.some(v => v.toString() === userId.toString())) {
      return res.status(400).json({ error: "You have already voted for this submission" });
    }

    submission.voteCount += 1;
    submission.voters.push(userId);

    contest.markModified("submissions");
    await contest.save();

    return res.status(200).json({
      success: true,
      voteCount: submission.voteCount,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/contests/:id/judge
// Host or admin sets judge scores on submissions (requireAuth)
// Blueprint §20: HOST or HYBRID judging
// ─────────────────────────────────────────────
router.post("/:id/judge", requireAuth, async (req, res) => {
  try {
    const { scores } = req.body; // Array: [{ submissionId, judgeScore }]
    if (!Array.isArray(scores) || scores.length === 0) {
      return res.status(400).json({ error: "scores array is required" });
    }

    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    // Only host or admin can judge
    if (
      contest.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Only the contest host or admin can submit judge scores" });
    }

    if (contest.votingMethod === "COMMUNITY") {
      return res.status(403).json({ error: "This contest uses community voting only — host scoring is disabled" });
    }

    for (const s of scores) {
      const submission = contest.submissions.id(s.submissionId);
      if (submission) {
        submission.judgeScore = s.judgeScore || 0;
      }
    }

    contest.status = "JUDGING";
    contest.markModified("submissions");
    await contest.save();

    return res.status(200).json({ success: true, message: "Judge scores applied", contest });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/contests/:id/complete
// Declare winners and distribute prizes (requireAuth: host or admin)
// Blueprint §22: 1st=500, 2nd=250, 3rd=100 SKA
// Notifies winners per blueprint §26
// ─────────────────────────────────────────────
router.post("/:id/complete", requireAuth, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    // Only host or admin can complete
    if (
      contest.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Only the contest host or admin can complete the contest" });
    }

    if (contest.status === "COMPLETED") {
      return res.status(400).json({ error: "Contest is already completed" });
    }

    // Sort submissions by combined score (votes + judgeScore for HYBRID, relevant field for others)
    let sorted = [...contest.submissions];
    if (contest.votingMethod === "COMMUNITY") {
      sorted.sort((a, b) => b.voteCount - a.voteCount);
    } else if (contest.votingMethod === "HOST") {
      sorted.sort((a, b) => b.judgeScore - a.judgeScore);
    } else {
      // HYBRID: weighted average (50/50)
      sorted.sort((a, b) => (b.voteCount + b.judgeScore) - (a.voteCount + a.judgeScore));
    }

    // Blueprint §22 reward amounts (same as tournament)
    const PLACEMENT_REWARDS = { 1: 500, 2: 250, 3: 100 };
    const distributions = [];

    for (let i = 0; i < Math.min(3, sorted.length); i++) {
      const submission = sorted[i];
      const placement = i + 1;
      const reward = PLACEMENT_REWARDS[placement];
      const winnerId = submission.userId;

      await rewardEngine.creditWallet(
        winnerId,
        reward,
        "CONTEST_REWARD",
        contest._id.toString(),
        "Contest",
        `Contest prize for ${placement === 1 ? "1st" : placement === 2 ? "2nd" : "3rd"} place in "${contest.name}"`
      );

      // Award TOURNAMENT_WIN XP (300 XP) for 1st place win
      if (placement === 1) {
        await xpEngine.awardXP(winnerId, "TOURNAMENT_WIN", contest._id.toString());
      }

      contest.winners.push({ userId: winnerId, placement, reward });
      distributions.push({ userId: winnerId, placement, reward });

      // Notify winner (blueprint §26: "Event reward received")
      const notif = await Notification.create({
        userId: winnerId,
        type: "EVENT_REWARD",
        title: "Contest Prize Won!",
        body: `Congratulations! You placed #${placement} in "${contest.name}" and won ${reward} SKA!`,
        referenceId: contest._id.toString(),
        referenceType: "Contest",
      });
      notifyUser(winnerId, notif);
    }

    // Award host XP for running the contest (HOST_EVENT = 250 XP)
    await xpEngine.awardXP(contest.createdBy, "HOST_EVENT", contest._id.toString());

    contest.status = "COMPLETED";
    await contest.save();

    return res.status(200).json({
      success: true,
      message: "Contest completed and prizes distributed",
      distributions,
      contest,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
