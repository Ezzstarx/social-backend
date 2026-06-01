const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    // 🔐 Auth
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true
    },

    // 👤 Profile
    profilePic: {
      type: String,
      default: ""
    },

    bio: {
      type: String,
      maxlength: 200,
      default: ""
    },

    // 🎨 Creator system
    isCreator: {
      type: Boolean,
      default: false
    },

    // 🌐 Web3
    walletAddress: {
      type: String,
      unique: true,
      sparse: true // allows null values but enforces uniqueness when present
    },

    totalEarnings: {
      type: Number,
      default: 0
    },

    // 📊 Stats (denormalized for speed)
    followersCount: {
      type: Number,
      default: 0
    },

    followingCount: {
      type: Number,
      default: 0
    },

    totalStories: {
      type: Number,
      default: 0
    },

    totalManga: {
      type: Number,
      default: 0
    },

    totalViews: {
      type: Number,
      default: 0
    },

    // ⚙️ Roles (future-proof)
    role: {
      type: String,
      enum: ["user", "creator", "admin"],
      default: "user"
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },

    authProvider: {
      type: String,
      enum: ["local", "google", "wallet"],
      default: "local"
    },

    onboardingComplete: {
      type: Boolean,
      default: false
    },

    primaryRole: {
      type: String,
      enum: ['READER', 'CREATOR', 'EVENT_HOST', 'GAMER']
    },

    country: {
      type: String
    },

    language: {
      type: String
    },

    bannerUrl: {
      type: String
    },

    displayName: {
      type: String
    },

    isSuspended: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true // adds createdAt & updatedAt automatically
  }
);

// 🔍 Indexes (important for performance)
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ walletAddress: 1 });

// 🚀 Export
module.exports = mongoose.model("User", UserSchema);