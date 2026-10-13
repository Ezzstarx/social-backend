const express = require("express");
const passport = require("passport");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const XPProfile = require("../models/XPProfile");
const LevelConfig = require("../models/LevelConfig");
const requireAuth = require("../middleware/requireAuth");

// Google OAuth - Step 1: Redirect to Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth - Step 2: Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/api/auth/google/failure" }),
  (req, res) => {
    const user = req.user;

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/oauth-success?token=${token}`);
  }
);

router.get("/google/failure", (req, res) => {
  res.status(401).json({ message: "Google authentication failed" });
});

// Wallet login / signup
router.post("/wallet", async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address is required" });
    }

    let user = await User.findOne({ walletAddress });

    if (!user) {
      user = await User.create({
        username: `user_${walletAddress.slice(-6).toLowerCase()}`,
        email: `${walletAddress.slice(-10).toLowerCase()}@wallet.ezzstar`,
        walletAddress,
        authProvider: "wallet",
        onboardingComplete: false,
      });

      await Wallet.create({ userId: user._id });
      await XPProfile.create({ userId: user._id, totalXP: 0, currentLevel: 1 });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ success: true, token, user: { _id: user._id, username: user.username } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Email login - send verification code (stub - implement with email service)
router.post("/send-code", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // In production, generate a random code, store it with expiry, and send via email
    // For now, return success (the code would be "123456" for development)
    res.status(200).json({ success: true, message: "Verification code sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Email login - verify code and return JWT
router.post("/login", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: "Email and code are required" });
    }

    // In production, verify the code against stored value
    // For development, accept "123456" as valid code
    if (code !== "123456") {
      return res.status(401).json({ error: "Invalid verification code" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        username: email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toLowerCase(),
        email,
        password: `email_${Date.now()}`,
        authProvider: "local",
        onboardingComplete: false,
      });

      await Wallet.create({ userId: user._id });
      await XPProfile.create({ userId: user._id, totalXP: 0, currentLevel: 1 });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ success: true, token, user: { _id: user._id, username: user.username } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/me
// Blueprint §28: Returns current user + wallet + XP + onboarding status
router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    const userObj = req.user.toObject();
    delete userObj.password;

    // Wallet
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) wallet = await Wallet.create({ userId });

    // XP Profile with level configs
    let xpProfile = await XPProfile.findOne({ userId });
    if (!xpProfile) xpProfile = await XPProfile.create({ userId, totalXP: 0, currentLevel: 1 });

    const currentLevelConfig = await LevelConfig.findOne({ level: xpProfile.currentLevel });
    const nextLevelConfig = await LevelConfig.findOne({ level: xpProfile.currentLevel + 1 });

    return res.status(200).json({
      success: true,
      user: userObj,
      wallet,
      xpProfile,
      currentLevelConfig,
      nextLevelConfig,
      onboardingComplete: req.user.onboardingComplete,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
