const mongoose = require("mongoose");

const BoostCampaignSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contentType: {
      type: String,
      enum: ["MANGA_CHAPTER", "STORY_PART", "GIST", "GIST_TOPIC", "EVENT", "TOURNAMENT", "CONTEST"],
      required: true,
    },
    contentId: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
      enum: ["STARTER", "GROWTH", "VIRAL"],
      required: true,
    },
    cost: {
      type: Number,
      required: true,
    },
    durationDays: {
      type: Number,
      required: true,
    },
    impressionTarget: {
      type: Number,
      required: true,
    },
    impressionCount: {
      type: Number,
      default: 0,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "PAUSED"],
      default: "ACTIVE",
    },
    startsAt: {
      type: Date,
      required: true,
    },
    endsAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

BoostCampaignSchema.index({ status: 1, endsAt: 1 });
BoostCampaignSchema.index({ userId: 1 });

module.exports = mongoose.model("BoostCampaign", BoostCampaignSchema);
