const mongoose = require("mongoose");
const LevelConfig = require("../models/LevelConfig");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ezzstar";

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    await LevelConfig.deleteMany({});
    console.log("Cleared old LevelConfig records.");

    const levels = [];
    for (let level = 1; level <= 100; level++) {
      const xpRequired = Math.round(500 * Math.pow(level, 1.8));
      const skaTotalReward = Math.round((5 + (2500 - 5) * (level - 1) / 99) * 100) / 100;
      const skaUtilityPortion = Math.round((skaTotalReward * 0.7) * 100) / 100;
      const skaEarnedPortion = Math.round((skaTotalReward * 0.3) * 100) / 100;

      levels.push({
        level,
        xpRequired,
        skaTotalReward,
        skaUtilityPortion,
        skaEarnedPortion,
      });
    }

    await LevelConfig.insertMany(levels);
    console.log("Successfully seeded 100 levels into LevelConfig!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
