const mongoose = require("mongoose");

const TournamentMatchSchema = new mongoose.Schema(
  {
    bracketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TournamentBracket",
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    round: {
      type: Number,
      required: true,
    },
    participant1Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    participant2Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    winnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "COMPLETED", "DISPUTED"],
      default: "PENDING",
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

TournamentMatchSchema.index({ bracketId: 1, round: 1 });

module.exports = mongoose.model("TournamentMatch", TournamentMatchSchema);
