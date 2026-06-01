const mongoose = require("mongoose");

const XPProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    totalXP: {
      type: Number,
      default: 0,
    },
    currentLevel: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

XPProfileSchema.index({ userId: 1 });

module.exports = mongoose.model("XPProfile", XPProfileSchema);
