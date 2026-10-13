const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const rewardEngine = require("../services/rewardEngine");
const xpEngine = require("../services/xpEngine");

// POST /api/tips/send
router.post("/send", requireAuth, async (req, res) => {
  try {
    const { contentType, contentId, amount } = req.body;
    const senderId = req.user._id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Tip amount must be greater than zero" });
    }

    const splits = await rewardEngine.processTipSplit(senderId, contentType, contentId, amount);
    await xpEngine.awardXP(senderId, "TIP_SENT", contentId);

    return res.status(200).json({ success: true, splits });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
