const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const XPProfile = require("../models/XPProfile");
const Notification = require("../models/Notification");
const requireAuth = require("../middleware/requireAuth");
const xpEngine = require("../services/xpEngine");
const { notifyUser } = require("../services/socket");

// POST /api/onboarding/role
router.post("/role", requireAuth, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["READER", "CREATOR", "EVENT_HOST", "GAMER"].includes(role)) {
      return res.status(400).json({ error: "Invalid primary role selected" });
    }

    const user = req.user;
    user.primaryRole = role;
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({ success: true, user: userObj });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/onboarding/profile
router.post("/profile", requireAuth, async (req, res) => {
  try {
    const { username, displayName, bio, country, language, avatarUrl, bannerUrl } = req.body;
    const user = req.user;
    const userId = user._id;

    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ error: "Username is already taken" });
      }
      user.username = username;
    }

    user.displayName = displayName || user.displayName;
    user.bio = bio || user.bio;
    user.country = country || user.country;
    user.language = language || user.language;
    if (avatarUrl) user.profilePic = avatarUrl;
    if (bannerUrl) user.bannerUrl = bannerUrl;
    user.onboardingComplete = true;
    await user.save();

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId });
    }

    let xpProfile = await XPProfile.findOne({ userId });
    if (!xpProfile) {
      xpProfile = await XPProfile.create({ userId, totalXP: 0, currentLevel: 1 });
    }

    const levelUpResult = await xpEngine.awardXP(userId, "PROFILE_COMPLETE", userId.toString(), 500);

    const notif = await Notification.create({
      userId,
      type: "PROFILE_COMPLETE",
      title: "Profile Onboarding Complete!",
      body: "Welcome to Ezzstar! Your profile is all set.",
      referenceId: userId.toString(),
      referenceType: "User",
    });
    notifyUser(userId, notif);

    wallet = await Wallet.findOne({ userId });
    xpProfile = await XPProfile.findOne({ userId });

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      success: true,
      user: userObj,
      wallet,
      xpProfile,
      levelUpResult,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
