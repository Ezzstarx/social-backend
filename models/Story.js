const mongoose = require("mongoose");

const StorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    coverImage: {
      type: String,
      default: ""
    },

    bannerImage: {
      type: String,
      default: ""
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    description: {
      type: String,
      default: ""
    },

    genres: [
      {
        type: String
      }
    ],

    tags: [
      {
        type: String
      }
    ],

    status: {
      type: String,
      enum: ["ongoing", "completed", "hiatus"],
      default: "ongoing"
    },

    language: {
      type: String,
      default: "en"
    },

    // 📊 Stats
    views: {
      type: Number,
      default: 0
    },

    subscribersCount: {
      type: Number,
      default: 0
    },

    likesCount: {
      type: Number,
      default: 0
    },

    totalChapters: {
      type: Number,
      default: 0
    },

    // 💰 Web3 / Monetization
    isPremium: {
      type: Boolean,
      default: false
    },

    pricePerChapter: {
      type: Number,
      default: 0
    },

    totalEarnings: {
      type: Number,
      default: 0
    },

    // ⭐ Rating
    rating: {
      type: Number,
      default: 0
    },

    totalRatings: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// 🔍 Indexes
StorySchema.index({ author: 1 });
StorySchema.index({ createdAt: -1 });
StorySchema.index({ genres: 1 });
StorySchema.index({ views: -1 });

module.exports = mongoose.model("Story", StorySchema);