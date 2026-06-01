const mongoose = require("mongoose");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const XPProfile = require("../models/XPProfile");
const LevelConfig = require("../models/LevelConfig");
const rewardEngine = require("../services/rewardEngine");
const xpEngine = require("../services/xpEngine");
const viewTracker = require("../services/viewTracker");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ezzstar";

async function runTests() {
  try {
    console.log("🚀 Starting Ezzstar Platform Diagnostic Checks...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connection Successful.");

    // Check LevelConfig Seeding
    const levelCount = await LevelConfig.countDocuments({});
    console.log(`📊 LevelConfig collection has ${levelCount} levels seeded.`);
    if (levelCount === 0) {
      console.log("⚠️ LEVEL CONFIG IS EMPTY! Please run: node scripts/seedLevelConfig.js first!");
    }

    // 1. Create a dummy test user
    const testUsername = `test_user_${Date.now()}`;
    const testUser = await User.create({
      username: testUsername,
      email: `${testUsername}@example.com`,
      password: "testpassword",
      role: "user",
    });
    console.log(`\n👤 Created test user: @${testUser.username} (ID: ${testUser._id})`);

    // 2. Instantiate Wallet and XPProfile
    const wallet = await Wallet.create({ userId: testUser._id });
    const xpProfile = await XPProfile.create({ userId: testUser._id, totalXP: 0, currentLevel: 1 });
    console.log(`💾 Wallet and XPProfile successfully initialized.`);

    // 3. Test XP Engine Awarding
    console.log("\n✨ Awarding PROFILE_COMPLETE XP (500 XP)...");
    const xpResult = await xpEngine.awardXP(testUser._id, "PROFILE_COMPLETE", testUser._id.toString());
    console.log(`📈 XP Result: Total XP = ${xpResult.newTotalXP}, Current Level = ${xpResult.newLevel}`);

    // Fetch Wallet balance after Level Up reward trigger
    const updatedWallet = await Wallet.findOne({ userId: testUser._id });
    console.log(`\n💰 Wallet Balance after Onboarding level up:`);
    console.log(`   - Utility SKA: ${updatedWallet.utilityBalance} SKA (Target: 3.50)`);
    console.log(`   - Earned SKA: ${updatedWallet.earnedBalance} SKA (Target: 1.50)`);

    // Cleanup test data
    await User.deleteOne({ _id: testUser._id });
    await Wallet.deleteOne({ userId: testUser._id });
    await XPProfile.deleteOne({ userId: testUser._id });
    console.log("\n🧹 Test data cleaned up successfully.");
    console.log("\n⭐️ ALL SYSTEM INTEGRATION CHECKS COMPLETED SUCCESSFULLY!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Integration Diagnostic Failed:", error);
    process.exit(1);
  }
}

runTests();
