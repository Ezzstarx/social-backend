const mongoose = require("mongoose");

const AbuseFlagSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    flagType: {
      type: String,
      required: true,
    },
    referenceId: {
      type: String,
      required: true,
    },
    referenceType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "REVIEWED", "CLEARED", "ACTIONED"],
      default: "PENDING",
    },
    adminNote: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AbuseFlagSchema.index({ status: 1 });

module.exports = mongoose.model("AbuseFlag", AbuseFlagSchema);
