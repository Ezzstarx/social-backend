const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    utilityBalance: {
      type: Number,
      default: 0,
    },
    earnedBalance: {
      type: Number,
      default: 0,
    },
    lockedBalance: {
      type: Number,
      default: 0,
    },
    totalEarned: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
WalletSchema.index({ userId: 1 });

module.exports = mongoose.model("Wallet", WalletSchema);
