const mongoose = require("mongoose");

const MangaEpisodeSchema = new mongoose.Schema(
  {
    manga: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Manga",
      required: true
    },

    title: {
      type: String,
      default: ""
    },

    episodeNumber: {
      type: Number,
      required: true
    },

    pages: [
      {
        imageUrl: {
          type: String,
          required: true
        },
        order: {
          type: Number,
          required: true
        }
      }
    ],

    // 📊 Stats
    views: {
      type: Number,
      default: 0
    },

    likesCount: {
      type: Number,
      default: 0
    },

    commentsCount: {
      type: Number,
      default: 0
    },

    // 💰 Monetization
    isLocked: {
      type: Boolean,
      default: false
    },

    price: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// 🔍 Indexes
MangaEpisodeSchema.index({ manga: 1, episodeNumber: 1 }, { unique: true });

module.exports = mongoose.model("MangaEpisode", MangaEpisodeSchema);