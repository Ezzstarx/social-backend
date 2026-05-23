const mongoose = require("mongoose");

const GistTopicSchema = new mongoose.Schema(
  {
    gistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gist",
      required: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    qualifiedViewCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    shareCount: {
      type: Number,
      default: 0,
    },
    lastRewardedMilestone: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

GistTopicSchema.index({ gistId: 1 });
GistTopicSchema.index({ creatorId: 1 });
GistTopicSchema.index({ qualifiedViewCount: -1 });

module.exports = mongoose.model("GistTopic", GistTopicSchema);
