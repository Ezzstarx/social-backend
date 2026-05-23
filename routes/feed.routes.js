const express = require("express");
const router = express.Router();
const Wallet = require("../models/Wallet");
const XPProfile = require("../models/XPProfile");
const Gist = require("../models/Gist");
const GistTopic = require("../models/GistTopic");
const Event = require("../models/Event");
const BoostCampaign = require("../models/BoostCampaign");
const Notification = require("../models/Notification");
const requireAuth = require("../middleware/requireAuth");
const requireOnboarding = require("../middleware/requireOnboarding");
const { notifyUser } = require("../services/socket");

// GET /api/feed/home
router.get("/home", requireAuth, requireOnboarding, async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Current user Wallet
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId });
    }

    // 2. XPProfile with level details
    let xp = await XPProfile.findOne({ userId });
    if (!xp) {
      xp = await XPProfile.create({ userId, totalXP: 0, currentLevel: 1 });
    }

    // 3. Trending Gists (5 Gists sorted by sum of topic activity last 48 hours)
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const gistActivities = await GistTopic.aggregate([
      { $match: { createdAt: { $gte: cutoff } } },
      {
        $group: {
          _id: "$gistId",
          activityScore: { $sum: { $add: ["$qualifiedViewCount", "$commentCount", "$shareCount"] } },
        },
      },
      { $sort: { activityScore: -1 } },
      { $limit: 5 },
    ]);

    const gistIds = gistActivities.map((ga) => ga._id);
    let trendingGists = await Gist.find({ _id: { $in: gistIds } }).populate("creatorId", "username displayName profilePic");
    if (trendingGists.length < 5) {
      const extraGists = await Gist.find({ _id: { $nin: gistIds } })
        .limit(5 - trendingGists.length)
        .populate("creatorId", "username displayName profilePic");
      trendingGists = trendingGists.concat(extraGists);
    }

    // 4. Trending Topics (5 GistTopics sorted by qualifiedViewCount + commentCount + shareCount last 48 hours)
    let trendingTopics = await GistTopic.find({ createdAt: { $gte: cutoff } })
      .populate("creatorId", "username displayName profilePic")
      .populate("gistId")
      .lean();

    trendingTopics.sort((a, b) => {
      const aScore = (a.qualifiedViewCount || 0) + (a.commentCount || 0) + (a.shareCount || 0);
      const bScore = (b.qualifiedViewCount || 0) + (b.commentCount || 0) + (b.shareCount || 0);
      return bScore - aScore;
    });
    trendingTopics = trendingTopics.slice(0, 5);

    if (trendingTopics.length < 5) {
      let extraTopics = await GistTopic.find({ createdAt: { $lt: cutoff } })
        .populate("creatorId", "username displayName profilePic")
        .populate("gistId")
        .lean();
      extraTopics.sort((a, b) => {
        const aScore = (a.qualifiedViewCount || 0) + (a.commentCount || 0) + (a.shareCount || 0);
        const bScore = (b.qualifiedViewCount || 0) + (b.commentCount || 0) + (b.shareCount || 0);
        return bScore - aScore;
      });
      trendingTopics = trendingTopics.concat(extraTopics).slice(0, 5);
    }

    // 5. Active Events (5 Events with status 'upcoming' or 'open', sorted by date ascending)
    const activeEvents = await Event.find({ status: { $in: ["UPCOMING", "ONGOING", "upcoming", "ongoing"] } })
      .sort({ date: 1 })
      .limit(5);

    // 6. Boosted Content (up to 4 active BoostCampaigns, increment impressionCount for each)
    const boostedContent = await BoostCampaign.find({ status: "ACTIVE" }).limit(4);
    for (const campaign of boostedContent) {
      campaign.impressionCount += 1;
      if (campaign.impressionCount >= campaign.impressionTarget) {
        campaign.status = "COMPLETED";

        const notif = await Notification.create({
          userId: campaign.userId,
          type: "BOOST_COMPLETED",
          title: "Boost Campaign Completed!",
          body: `Your promotion for ${campaign.contentType} met its target of ${campaign.impressionTarget} impressions!`,
          referenceId: campaign._id.toString(),
          referenceType: "BoostCampaign",
        });
        notifyUser(campaign.userId, notif);
      }
      await campaign.save();
    }

    // 7. Recent Notifications (5 newest unread Notifications)
    const recentNotifications = await Notification.find({ userId, isRead: false })
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      wallet,
      xp,
      trendingGists,
      trendingTopics,
      activeEvents,
      boostedContent,
      recentNotifications,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
