const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const XPProfile = require("../models/XPProfile");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 🔍 Check if user exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // 📧 Check if email already exists (merge accounts)
        const email = profile.emails[0].value;
        user = await User.findOne({ email });

        if (user) {
          user.googleId = profile.id;
          user.authProvider = "google";
          await user.save();
          return done(null, user);
        }

        // 🆕 Create new user
        user = await User.create({
          username: profile.displayName.replace(/\s+/g, "").toLowerCase(),
          email: email,
          googleId: profile.id,
          authProvider: "google",
          profilePic: profile.photos[0]?.value
        });

        // Instantiate Wallet and XPProfile documents on signup
        await Wallet.create({ userId: user._id });
        await XPProfile.create({ userId: user._id, totalXP: 0, currentLevel: 1 });

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);