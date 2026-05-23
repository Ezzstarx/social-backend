const View = require("../models/View");
const MangaEpisode = require("../models/MangaEpisode");
const Chapter = require("../models/chapter");
const GistTopic = require("../models/GistTopic");
const rewardEngine = require("./rewardEngine");
const xpEngine = require("./xpEngine");

const viewerHistory = new Map();
const ipHistory = new Map();
const deviceHistory = new Map();
const boostedFractionalAccumulator = new Map();

async function getContentOwnerId(contentType, contentId) {
  if (contentType === "MANGA_CHAPTER") {
    const episode = await MangaEpisode.findById(contentId).populate("manga");
    return episode?.manga?.author;
  } else if (contentType === "STORY_PART") {
    const chapterDoc = await Chapter.findById(contentId).populate("story");
    return chapterDoc?.story?.author;
  } else if (contentType === "GIST_TOPIC") {
    const topic = await GistTopic.findById(contentId);
    return topic?.creatorId;
  }
  return null;
}

async function incrementQualifiedViewCount(contentType, contentId, incrementVal) {
  if (incrementVal <= 0) return null;
  if (contentType === "MANGA_CHAPTER") {
    const doc = await MangaEpisode.findByIdAndUpdate(contentId, { $inc: { qualifiedViewCount: incrementVal } }, { new: true });
    return { count: doc?.qualifiedViewCount || 0, lastRewarded: doc?.lastRewardedAtView || 0 };
  } else if (contentType === "STORY_PART") {
    const doc = await Chapter.findByIdAndUpdate(contentId, { $inc: { qualifiedViewCount: incrementVal } }, { new: true });
    return { count: doc?.qualifiedViewCount || 0, lastRewarded: doc?.lastRewardedAtView || 0 };
  } else if (contentType === "GIST_TOPIC") {
    const doc = await GistTopic.findByIdAndUpdate(contentId, { $inc: { qualifiedViewCount: incrementVal } }, { new: true });
    return { count: doc?.qualifiedViewCount || 0, lastRewarded: doc?.lastRewardedMilestone || 0 };
  }
  return null;
}

async function updateLastRewardedAtView(contentType, contentId, newLastRewardedVal) {
  if (contentType === "MANGA_CHAPTER") {
    await MangaEpisode.findByIdAndUpdate(contentId, { lastRewardedAtView: newLastRewardedVal });
  } else if (contentType === "STORY_PART") {
    await Chapter.findByIdAndUpdate(contentId, { lastRewardedAtView: newLastRewardedVal });
  } else if (contentType === "GIST_TOPIC") {
    await GistTopic.findByIdAndUpdate(contentId, { lastRewardedMilestone: newLastRewardedVal });
  }
}

async function recordView(contentType, contentId, viewerUserId, ipHash, deviceHash, durationSeconds, isBoosted) {
  let minDuration = 20;
  if (contentType === "MANGA_CHAPTER") minDuration = 30;
  else if (contentType === "STORY_PART") minDuration = 20;
  else if (contentType === "GIST_TOPIC") minDuration = 20;

  if (durationSeconds < minDuration) {
    return { qualified: false, reason: "Duration too short" };
  }

  const ownerId = await getContentOwnerId(contentType, contentId);
  if (viewerUserId && ownerId && viewerUserId.toString() === ownerId.toString()) {
    return { qualified: false, reason: "Self view" };
  }

  if (viewerUserId) {
    const key = `${viewerUserId}:${contentType}:${contentId}`;
    const lastViewed = viewerHistory.get(key);
    if (lastViewed && Date.now() - lastViewed < 24 * 3600 * 1000) {
      return { qualified: false, reason: "Already viewed in past 24 hours" };
    }
  }

  if (ipHash) {
    const key = `${ipHash}:${contentType}:${contentId}`;
    let list = ipHistory.get(key) || [];
    list = list.filter(ts => Date.now() - ts < 24 * 3600 * 1000);
    if (list.length >= 3) {
      return { qualified: false, reason: "IP view limit exceeded for past 24 hours" };
    }
    list.push(Date.now());
    ipHistory.set(key, list);
  }

  if (deviceHash) {
    const key = `${deviceHash}:${contentType}:${contentId}`;
    let list = deviceHistory.get(key) || [];
    list = list.filter(ts => Date.now() - ts < 24 * 3600 * 1000);
    if (list.length >= 3) {
      return { qualified: false, reason: "Device view limit exceeded for past 24 hours" };
    }
    list.push(Date.now());
    deviceHistory.set(key, list);
  }

  if (viewerUserId) {
    const key = `${viewerUserId}:${contentType}:${contentId}`;
    viewerHistory.set(key, Date.now());
  }

  let incrementVal = 1.0;
  if (isBoosted) {
    const key = `${contentType}:${contentId}`;
    const accumulated = boostedFractionalAccumulator.get(key) || 0;
    const nextVal = accumulated + 0.25;
    if (nextVal >= 1.0) {
      boostedFractionalAccumulator.set(key, nextVal - 1.0);
      incrementVal = 1.0;
    } else {
      boostedFractionalAccumulator.set(key, nextVal);
      incrementVal = 0.0;
    }
  }

  await View.create({
    contentType,
    contentId,
    viewerUserId,
    ipHash,
    deviceHash,
    durationSeconds,
    isQualified: true,
    isBoosted,
  });

  if (incrementVal > 0) {
    const result = await incrementQualifiedViewCount(contentType, contentId, incrementVal);
    if (result && ownerId) {
      const newLastRewarded = await rewardEngine.processViewReward(
        ownerId,
        contentType,
        contentId,
        result.count,
        result.lastRewarded
      );
      await updateLastRewardedAtView(contentType, contentId, newLastRewarded);
      await xpEngine.awardXP(ownerId, "QUALIFIED_VIEW", contentId);
    }
  }

  return { qualified: true, viewCount: incrementVal > 0 ? 1 : 0 };
}

module.exports = {
  recordView,
};
