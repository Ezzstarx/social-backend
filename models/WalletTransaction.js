const mongoose = require("mongoose");

const WalletTransactionSchema = new mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "LEVEL_REWARD",
        "VIEW_REWARD",
        "GIST_REWARD",
        "TIP_RECEIVED",
        "TIP_SENT",
        "TIP_SPLIT",
        "BOOST_SPEND",
        "EVENT_ENTRY",
        "EVENT_HOST_EARN",
        "TOURNAMENT_WIN",
        "CONTEST_WIN",
        "PLATFORM_FEE",
        "ONBOARDING_REWARD",
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    direction: {
      type: String,
      enum: ["CREDIT", "DEBIT"],
      required: true,
    },
    status: {
      type: String,
      enum: ["COMPLETED", "PENDING", "LOCKED", "REJECTED"],
      default: "COMPLETED",
    },
    referenceId: {
      type: String,
    },
    referenceType: {
      type: String,
    },
    note: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

WalletTransactionSchema.index({ userId: 1, createdAt: -1 });
WalletTransactionSchema.index({ walletId: 1 });

module.exports = mongoose.model("WalletTransaction", WalletTransactionSchema);
