module.exports = (req, res, next) => {
  if (!req.user.onboardingComplete) {
    return res.status(403).json({ error: "Onboarding required", redirect: "/onboarding" });
  }
  next();
};
