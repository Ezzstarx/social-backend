const mongoose = require("mongoose");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const LevelConfig = require("../models/LevelConfig");
const Notification = require("../models/Notification");
const Tip = require("../models/Tip");
const BoostCampaign = require("../models/BoostCampaign");
const Event = require("../models/Event");
const User = require("../models/User");
const MangaEpisode = require("../models/MangaEpisode");
const Chapter = require("../models/chapter");
const GistTopic = require("../models/GistTopic");
const { notifyUser } = require("./socket");

async function creditWallet(userId, amount, type, referenceId, referenceType, note, targetField = "earned") {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({ userId });
  }
  if (targetField === "utility") {
    wallet.utilityBalance += amount;
  } else {
    wallet.earnedBalance += amount;
  }
  wallet.totalEarned += amount;
  await wallet.save();

  await WalletTransaction.create({
    walletId: wallet._id,
    userId,
    type,
    amount,
    direction: "CREDIT",
    status: "COMPLETED",
    referenceId,
    referenceType,
    note,
  });

  return wallet;
}

async function debitWallet(userId, amount, type, referenceId, referenceType, note) {
  const wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    throw new Error("Wallet not found");
  }
  
  const totalAvailable = wallet.utilityBalance + wallet.earnedBalance;
  if (totalAvailable < amount) {
    throw new Error("Insufficient balance");
  }

  let remaining = amount;
  if (wallet.utilityBalance >= remaining) {
    wallet.utilityBalance -= remaining;
    remaining = 0;
  } else {
    remaining -= wallet.utilityBalance;
    wallet.utilityBalance = 0;
    wallet.earnedBalance -= remaining;
    remaining = 0;
  }

  wallet.totalSpent += amount;
  await wallet.save();

  await WalletTransaction.create({
    walletId: wallet._id,
    userId,
    type,
    amount,
    direction: "DEBIT",
    status: "COMPLETED",
    referenceId,
    referenceType,
    note,
  });

  return wallet;
}

async function processLevelUpReward(userId, level) {
  const config = await LevelConfig.findOne({ level });
  if (!config) {
    throw new Error(`LevelConfig not found for level ${level}`);
  }
  
  await creditWallet(userId, config.skaUtilityPortion, "LEVEL_REWARD", level.toString(), "LevelConfig", `Level ${level} Utility Reward`, "utility");
  await creditWallet(userId, config.skaEarnedPortion, "LEVEL_REWARD", level.toString(), "LevelConfig", `Level ${level} Earned Reward`, "earned");

  const notif = await Notification.create({
    userId,
    type: "LEVEL_UP",
    title: "Leveled Up!",
    body: `Congratulations! You reached level ${level} and earned ${config.skaTotalReward} SKA!`,
    referenceId: level.toString(),
    referenceType: "LevelConfig",
  });
  notifyUser(userId, notif);

  return {
    skaUtilityPortion: config.skaUtilityPortion,
    skaEarnedPortion: config.skaEarnedPortion,
    totalReward: config.skaTotalReward,
  };
}

async function processViewReward(userId, contentType, contentId, currentQualifiedViews, lastRewardedAtView) {
  const milestoneCount = Math.floor(currentQualifiedViews / 1000) - Math.floor(lastRewardedAtView / 1000);
  let newLastRewardedAtView = lastRewardedAtView;
  if (milestoneCount > 0) {
    for (let i = 0; i < milestoneCount; i++) {
      await creditWallet(userId, 25, "VIEW_REWARD", contentId, contentType, `1000-view milestone reached for ${contentType}`, "earned");
    }
    newLastRewardedAtView = Math.floor(currentQualifiedViews / 1000) * 1000;
    
    const notif = await Notification.create({
      userId,
      type: "VIEW_REWARD",
      title: "View Milestone Reached!",
      body: `Your content reached a new 1000-view milestone! You earned ${milestoneCount * 25} SKA.`,
      referenceId: contentId,
      referenceType: contentType,
    });
    notifyUser(userId, notif);
  }
  return newLastRewardedAtView;
}

async function processGistActivityReward(gistCreatorId, topicId) {
  const wallet = await creditWallet(gistCreatorId, 2, "GIST_REWARD", topicId, "GistTopic", "Gist Topic Activity Reward", "earned");
  const notif = await Notification.create({
    userId: gistCreatorId,
    type: "GIST_REWARD",
    title: "Gist Activity Reward!",
    body: "Your gist topic met engagement milestone! You received 2 SKA.",
    referenceId: topicId,
    referenceType: "GistTopic",
  });
  notifyUser(gistCreatorId, notif);
  return { wallet, notification: notif };
}

async function processTipSplit(senderId, contentType, contentId, amount) {
  let creatorId = null;
  let splits = {};
  
  if (contentType === "GIST_TOPIC") {
    const topic = await GistTopic.findById(contentId).populate("gistId");
    if (!topic) throw new Error("Gist topic not found");
    const topicCreatorId = topic.creatorId;
    const gistCreatorId = topic.gistId.creatorId;
    
    if (topicCreatorId.toString() === gistCreatorId.toString()) {
      const creatorAmount = amount * 0.95;
      const platformAmount = amount * 0.05;
      splits = {
        creatorId: topicCreatorId,
        creatorAmount,
        platformAmount,
      };
      await debitWallet(senderId, amount, "TIP_SENT", contentId, contentType, `Tip to ${contentType}`);
      await creditWallet(topicCreatorId, creatorAmount, "TIP_RECEIVED", contentId, contentType, `Tip received`);
    } else {
      const topicCreatorAmount = amount * 0.80;
      const gistCreatorAmount = amount * 0.15;
      const platformAmount = amount * 0.05;
      splits = {
        topicCreatorId,
        topicCreatorAmount,
        gistCreatorId,
        gistCreatorAmount,
        platformAmount,
      };
      await debitWallet(senderId, amount, "TIP_SENT", contentId, contentType, `Tip split to ${contentType}`);
      await creditWallet(topicCreatorId, topicCreatorAmount, "TIP_RECEIVED", contentId, contentType, `Tip split received`);
      await creditWallet(gistCreatorId, gistCreatorAmount, "TIP_SPLIT", contentId, contentType, `Tip split as Gist host`);
    }
  } else if (contentType === "MANGA_CHAPTER") {
    const episode = await MangaEpisode.findById(contentId).populate("manga");
    if (!episode) throw new Error("Manga episode not found");
    creatorId = episode.manga.author;
  } else if (contentType === "STORY_PART") {
    const chapterDoc = await Chapter.findById(contentId).populate("story");
    if (!chapterDoc) throw new Error("Story chapter not found");
    creatorId = chapterDoc.story.author;
  } else if (contentType === "CREATOR_PROFILE") {
    creatorId = contentId;
  }
  
  if (contentType !== "GIST_TOPIC") {
    if (!creatorId) throw new Error("Creator not found");
    const creatorAmount = amount * 0.95;
    const platformAmount = amount * 0.05;
    splits = {
      creatorId,
      creatorAmount,
      platformAmount,
    };
    await debitWallet(senderId, amount, "TIP_SENT", contentId, contentType, `Tip to creator`);
    await creditWallet(creatorId, creatorAmount, "TIP_RECEIVED", contentId, contentType, `Tip received`);
  }

  const tip = await Tip.create({
    senderId,
    amount,
    contentType,
    contentId,
    splits,
  });

  if (splits.creatorId) {
    const notif = await Notification.create({
      userId: splits.creatorId,
      type: "TIP_RECEIVED",
      title: "Tip Received!",
      body: `You received a tip of ${splits.creatorAmount} SKA!`,
      referenceId: tip._id.toString(),
      referenceType: "Tip",
    });
    notifyUser(splits.creatorId, notif);
  }
  if (splits.topicCreatorId) {
    const notif = await Notification.create({
      userId: splits.topicCreatorId,
      type: "TIP_RECEIVED",
      title: "Tip Received!",
      body: `You received a split tip of ${splits.topicCreatorAmount} SKA!`,
      referenceId: tip._id.toString(),
      referenceType: "Tip",
    });
    notifyUser(splits.topicCreatorId, notif);
  }
  if (splits.gistCreatorId) {
    const notif = await Notification.create({
      userId: splits.gistCreatorId,
      type: "GIST_TIP_SHARE",
      title: "Gist Tip Share Received!",
      body: `You received a gist host split tip of ${splits.gistCreatorAmount} SKA!`,
      referenceId: tip._id.toString(),
      referenceType: "Tip",
    });
    notifyUser(splits.gistCreatorId, notif);
  }

  return splits;
}

async function processBoostSpend(userId, plan, contentType, contentId) {
  let cost = 0;
  let durationDays = 0;
  let impressionTarget = 0;
  if (plan === "STARTER") {
    cost = 40;
    durationDays = 1;
    impressionTarget = 1000;
  } else if (plan === "GROWTH") {
    cost = 180;
    durationDays = 3;
    impressionTarget = 5000;
  } else if (plan === "VIRAL") {
    cost = 325;
    durationDays = 7;
    impressionTarget = 10000;
  } else {
    throw new Error("Invalid boost plan");
  }

  const wallet = await Wallet.findOne({ userId });
  if (!wallet || wallet.utilityBalance < cost) {
    throw new Error("Insufficient utility balance for boost");
  }

  wallet.utilityBalance -= cost;
  wallet.totalSpent += cost;
  await wallet.save();

  await WalletTransaction.create({
    walletId: wallet._id,
    userId,
    type: "BOOST_SPEND",
    amount: cost,
    direction: "DEBIT",
    status: "COMPLETED",
    referenceId: contentId,
    referenceType: contentType,
    note: `Boost Spend: ${plan}`,
  });

  const startsAt = new Date();
  const endsAt = new Date();
  endsAt.setDate(endsAt.getDate() + durationDays);

  const campaign = await BoostCampaign.create({
    userId,
    contentType,
    contentId,
    plan,
    cost,
    durationDays,
    impressionTarget,
    status: "ACTIVE",
    startsAt,
    endsAt,
  });

  const notif = await Notification.create({
    userId,
    type: "BOOST_STARTED",
    title: "Boost Started!",
    body: `Your boost campaign for ${contentType} has successfully started! Target impressions: ${impressionTarget}.`,
    referenceId: campaign._id.toString(),
    referenceType: "BoostCampaign",
  });
  notifyUser(userId, notif);

  return campaign;
}

async function processEventEntryFee(userId, eventId, entryFee) {
  const event = await Event.findById(eventId);
  if (!event) throw new Error("Event not found");

  await debitWallet(userId, entryFee, "EVENT_ENTRY", eventId.toString(), "Event", `Entry fee for event ${event.name}`);

  const prizePoolShare = entryFee * 0.80;
  const hostShare = entryFee * 0.15;
  const platformShare = entryFee * 0.05;

  event.prizePool = (event.prizePool || 0) + prizePoolShare;
  await event.save();

  let hostId = null;
  if (mongoose.Types.ObjectId.isValid(event.createdBy)) {
    hostId = event.createdBy;
    await creditWallet(hostId, hostShare, "EVENT_HOST_EARN", eventId.toString(), "Event", `Host earnings from registration`);
  }

  return {
    prizePoolShare,
    hostShare,
    platformShare,
    hostId,
  };
}

async function processEventPrizeDistribution(eventId, placements) {
  const event = await Event.findById(eventId);
  const distributed = [];

  for (const p of placements) {
    let reward = 0;
    if (p.placement === 1) reward = 500;
    else if (p.placement === 2) reward = 250;
    else if (p.placement === 3) reward = 100;
    else continue;

    await creditWallet(p.userId, reward, "TOURNAMENT_WIN", eventId.toString(), "Event", `Event Prize for placement #${p.placement}`);
    
    const notif = await Notification.create({
      userId: p.userId,
      type: "EVENT_REWARD",
      title: "Tournament Reward Earned!",
      body: `Congratulations! You placed #${p.placement} in ${event?.name || 'Tournament'} and won ${reward} SKA!`,
      referenceId: eventId.toString(),
      referenceType: "Event",
    });
    notifyUser(p.userId, notif);

    distributed.push({ userId: p.userId, reward, placement: p.placement });
  }

  return distributed;
}

module.exports = {
  creditWallet,
  debitWallet,
  processLevelUpReward,
  processViewReward,
  processGistActivityReward,
  processTipSplit,
  processBoostSpend,
  processEventEntryFee,
  processEventPrizeDistribution,
};
