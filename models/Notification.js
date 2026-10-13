const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "PROFILE_COMPLETE",
        "LEVEL_UP",
        "SKA_EARNED",
        "TIP_RECEIVED",
        "GIST_TIP_SHARE",
        "GIST_REWARD",
        "VIEW_REWARD",
        "CONTEST_JOINED",
        "TOURNAMENT_JOINED",
        "EVENT_REWARD",
        "BOOST_STARTED",
        "BOOST_COMPLETED",
        "LOW_BALANCE",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    referenceId: {
      type: String,
    },
    referenceType: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", NotificationSchema);
