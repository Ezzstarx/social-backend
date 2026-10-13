const mongoose = require("mongoose");

const ViewSchema = new mongoose.Schema(
  {
    contentType: {
      type: String,
      required: true,
    },
    contentId: {
      type: String,
      required: true,
    },
    viewerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    ipHash: {
      type: String,
      required: true,
    },
    deviceHash: {
      type: String,
      required: true,
    },
    durationSeconds: {
      type: Number,
      required: true,
    },
    isQualified: {
      type: Boolean,
      default: false,
    },
    isBoosted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ViewSchema.index({ contentType: 1, contentId: 1, createdAt: -1 });

module.exports = mongoose.model("View", ViewSchema);
