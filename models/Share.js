const mongoose = require("mongoose");

const ShareSchema = new mongoose.Schema(
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
    isSpam: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ShareSchema.index({ userId: 1, contentType: 1, contentId: 1 });

module.exports = mongoose.model("Share", ShareSchema);
