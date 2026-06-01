const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const rewardEngine = require("../services/rewardEngine");
const BoostCampaign = require("../models/BoostCampaign");
const Notification = require("../models/Notification");
const { notifyUser } = require("../services/socket");

// POST /api/boosts/create
router.post("/create", requireAuth, async (req, res) => {
  try {
    const { contentType, contentId, plan } = req.body;
    if (!["STARTER", "GROWTH", "VIRAL"].includes(plan)) {
      return res.status(400).json({ error: "Invalid plan selected" });
    }

    const campaign = await rewardEngine.processBoostSpend(req.user._id, plan, contentType, contentId);
    return res.status(201).json({ success: true, campaign });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/boosts/my
router.get("/my", requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };
    const campaigns = await BoostCampaign.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BoostCampaign.countDocuments(query);

    return res.status(200).json({
      success: true,
      campaigns,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/boosts/:id
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const campaign = await BoostCampaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    // Verify ownership
    if (campaign.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }
    return res.status(200).json({ success: true, campaign });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/boosts/:id/impression
router.post("/:id/impression", async (req, res) => {
  try {
    const campaign = await BoostCampaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: "Boost campaign not found" });
    }

    if (campaign.status === "ACTIVE") {
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

    return res.status(200).json({
      success: true,
      impressionCount: campaign.impressionCount,
      status: campaign.status,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
