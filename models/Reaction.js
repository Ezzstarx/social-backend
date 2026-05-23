const mongoose = require("mongoose");

const ReactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contentType: {
      type: String,
      required: true,
    },
    contentId: {
      type: String,
      required: true,
    },
    reactionType: {
      type: String,
      enum: ["LIKE", "LOVE", "FIRE", "WOW"],
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ReactionSchema.index({ userId: 1, contentType: 1, contentId: 1 }, { unique: true });

module.exports = mongoose.model("Reaction", ReactionSchema);
