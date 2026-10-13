const mongoose = require("mongoose");

const TipSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    contentType: {
      type: String,
      enum: ["MANGA_CHAPTER", "STORY_PART", "GIST_TOPIC", "CREATOR_PROFILE"],
      required: true,
    },
    contentId: {
      type: String,
      required: true,
    },
    splits: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

TipSchema.index({ senderId: 1, createdAt: -1 });

module.exports = mongoose.model("Tip", TipSchema);
