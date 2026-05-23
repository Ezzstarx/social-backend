const mongoose = require("mongoose");

const XPTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    xpProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "XPProfile",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    source: {
      type: String,
      enum: [
        "PROFILE_COMPLETE",
        "DAILY_VISIT",
        "PUBLISH_CHAPTER",
        "PUBLISH_STORY",
        "QUALIFIED_VIEW",
        "COMMENT",
        "SHARE",
        "TIP_SENT",
        "JOIN_EVENT",
        "REGISTER_EVENT",
        "TOURNAMENT_MATCH",
        "TOURNAMENT_WIN",
        "HOST_EVENT",
      ],
      required: true,
    },
    referenceId: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

XPTransactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("XPTransaction", XPTransactionSchema);
