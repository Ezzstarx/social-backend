const mongoose = require("mongoose");

const ChapterSchema = new mongoose.Schema(
  {
    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
      required: true
    },

    title: {
      type: String,
      default: ""
    },

    chapterNumber: {
      type: Number,
      required: true
    },

    content: {
      type: String,
      required: true
    },

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

// 🔍 Index
ChapterSchema.index({ story: 1, chapterNumber: 1 }, { unique: true });

module.exports = mongoose.model("Chapter", ChapterSchema);