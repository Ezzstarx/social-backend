const mongoose = require("mongoose");

const LevelConfigSchema = new mongoose.Schema(
  {
    level: {
      type: Number,
      required: true,
      unique: true,
    },
    xpRequired: {
      type: Number,
      required: true,
    },
    skaTotalReward: {
      type: Number,
      required: true,
    },
    skaUtilityPortion: {
      type: Number,
      required: true,
    },
    skaEarnedPortion: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LevelConfig", LevelConfigSchema);
