const mongoose = require("mongoose");

const MangaSchema = new mongoose.Schema(
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
      type: String, // optional for UI (like Webtoon header)
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

    totalEpisodes: {
      type: Number,
      default: 0
    },

    totalPages: {
      type: Number,
      default: 0
    },

    // 💰 Web3 / Monetization
    isPremium: {
      type: Boolean,
      default: false
    },

    pricePerEpisode: {
      type: Number,
      default: 0
    },

    totalEarnings: {
      type: Number,
      default: 0
    },

    // ⭐ Rating system
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

// 🔍 Indexes (important)
MangaSchema.index({ author: 1 });
MangaSchema.index({ createdAt: -1 });
MangaSchema.index({ genres: 1 });
MangaSchema.index({ views: -1 });

// 🚀 Export
module.exports = mongoose.model("Manga", MangaSchema);