const XPProfile = require("../models/XPProfile");
const XPTransaction = require("../models/XPTransaction");
const LevelConfig = require("../models/LevelConfig");
const rewardEngine = require("./rewardEngine");

const SOURCE_XP_AMOUNTS = {
  PROFILE_COMPLETE: 500,
  DAILY_VISIT: 10,
  PUBLISH_CHAPTER: 75,
  PUBLISH_STORY: 75,
  QUALIFIED_VIEW: 25,
  COMMENT: 5,
  SHARE: 10,
  TIP_SENT: 10,
  JOIN_EVENT: 10,
  REGISTER_EVENT: 25,
  TOURNAMENT_MATCH: 75,
  TOURNAMENT_WIN: 300,
  HOST_EVENT: 250,
};

const dailyQualifiedViewsXPCount = new Map();

function checkAndTrackViewXP(userId) {
  const todayStr = new Date().toISOString().split("T")[0];
  const userRecord = dailyQualifiedViewsXPCount.get(userId.toString());
  if (!userRecord || userRecord.dateString !== todayStr) {
    dailyQualifiedViewsXPCount.set(userId.toString(), { dateString: todayStr, count: 1 });
    return true;
  }
  if (userRecord.count >= 10) {
    return false;
  }
  userRecord.count += 1;
  return true;
}

async function awardXP(userId, source, referenceId, customAmount = null) {
  const amount = SOURCE_XP_AMOUNTS[source] !== undefined ? SOURCE_XP_AMOUNTS[source] : (customAmount || 0);
  if (amount <= 0) {
    const existing = await XPProfile.findOne({ userId });
    return {
      newTotalXP: existing ? existing.totalXP : 0,
      newLevel: existing ? existing.currentLevel : 1,
      leveledUp: false,
      levelsGained: 0,
    };
  }

  // Cap QUALIFIED_VIEW XP awards per user per day
  if (source === "QUALIFIED_VIEW") {
    const canAward = checkAndTrackViewXP(userId);
    if (!canAward) {
      const existing = await XPProfile.findOne({ userId });
      return {
        newTotalXP: existing ? existing.totalXP : 0,
        newLevel: existing ? existing.currentLevel : 1,
        leveledUp: false,
        levelsGained: 0,
      };
    }
  }

  let profile = await XPProfile.findOne({ userId });
  if (!profile) {
    profile = await XPProfile.create({ userId, totalXP: 0, currentLevel: 1 });
  }
  if (profile.currentLevel === 0) {
    profile.currentLevel = 1;
  }

  profile.totalXP += amount;

  await XPTransaction.create({
    userId,
    xpProfileId: profile._id,
    amount,
    source,
    referenceId,
  });

  let leveledUp = false;
  let levelsGained = 0;

  // Handle multiple level-ups by looping
  while (true) {
    const nextLevel = profile.currentLevel + 1;
    const nextLevelConfig = await LevelConfig.findOne({ level: nextLevel });
    if (!nextLevelConfig) break;

    if (profile.totalXP >= nextLevelConfig.xpRequired) {
      profile.currentLevel = nextLevel;
      leveledUp = true;
      levelsGained += 1;
      await rewardEngine.processLevelUpReward(userId, nextLevel);
    } else {
      break;
    }
  }

  await profile.save();

  return {
    newTotalXP: profile.totalXP,
    newLevel: profile.currentLevel,
    leveledUp,
    levelsGained,
  };
}

module.exports = {
  awardXP,
  SOURCE_XP_AMOUNTS,
};
