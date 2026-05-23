const express = require("express");
const passport = require("passport");
const router = express.Router();
const jwt = require("jsonwebtoken");

// 🔐 Step 1: Redirect to Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// 🔐 Step 2: Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/api/auth/google/failure" }),
  (req, res) => {
    const user = req.user;

    // 🎟️ Create JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    // 👉 Redirect to frontend with token
    res.redirect(`${frontendUrl}/oauth-success?token=${token}`);
  }
);

router.get("/google/failure", (req, res) => {
  res.status(401).json({ message: "Google authentication failed" });
});

module.exports = router;