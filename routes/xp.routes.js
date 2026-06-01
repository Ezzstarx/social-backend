const express = require("express");
const router = express.Router();
const XPProfile = require("../models/XPProfile");
const LevelConfig = require("../models/LevelConfig");
const requireAuth = require("../middleware/requireAuth");
const xpEngine = require("../services/xpEngine");

const dailyVisitTracker = new Map();

// GET /api/xp/me
router.get("/me", requireAuth, async (req, res) => {
  try {
    let profile = await XPProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await XPProfile.create({ userId: req.user._id, totalXP: 0, currentLevel: 1 });
    }
    if (profile.currentLevel === 0) {
      profile.currentLevel = 1;
    }

    const currentLevelConfig = await LevelConfig.findOne({ level: profile.currentLevel });
    const nextLevelConfig = await LevelConfig.findOne({ level: profile.currentLevel + 1 });

    return res.status(200).json({
      success: true,
      xpProfile: profile,
      currentLevelConfig,
      nextLevelConfig,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/xp/daily-visit
router.post("/daily-visit", requireAuth, async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const userIdStr = req.user._id.toString();
    const lastVisitDate = dailyVisitTracker.get(userIdStr);

    if (lastVisitDate === todayStr) {
      const profile = await XPProfile.findOne({ userId: req.user._id });
      return res.status(200).json({
        success: true,
        awarded: false,
        xpProfile: profile,
        message: "Daily visit reward already claimed today",
      });
    }

    dailyVisitTracker.set(userIdStr, todayStr);
    const result = await xpEngine.awardXP(req.user._id, "DAILY_VISIT", userIdStr);
    const profile = await XPProfile.findOne({ userId: req.user._id });

    return res.status(200).json({
      success: true,
      awarded: true,
      xpProfile: profile,
      levelUpResult: result,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
