const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const BoostCampaign = require("../models/BoostCampaign");
const AbuseFlag = require("../models/AbuseFlag");
const requireAuth = require("../middleware/requireAuth");
const requireAdmin = require("../middleware/requireAdmin");

// Apply admin protection to all routes below
router.use(requireAuth, requireAdmin);

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const onboardingCompleteCount = await User.countDocuments({ onboardingComplete: true });

    // Aggregate SKA distributed
    const distributedResult = await WalletTransaction.aggregate([
      { $match: { direction: "CREDIT", status: "COMPLETED" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalSKADistributed = distributedResult[0]?.total || 0;

    // Aggregate SKA spent
    const spentResult = await WalletTransaction.aggregate([
      { $match: { direction: "DEBIT", status: "COMPLETED" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalSKASpent = spentResult[0]?.total || 0;

    // Aggregate platform fees collected
    const feesResult = await WalletTransaction.aggregate([
      { $match: { type: "PLATFORM_FEE", status: "COMPLETED" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const platformFeesCollected = feesResult[0]?.total || 0;

    const activeCampaigns = await BoostCampaign.countDocuments({ status: "ACTIVE" });

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        onboardingCompleteCount,
        totalSKADistributed,
        totalSKASpent,
        platformFeesCollected,
        activeCampaigns,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.role) query.role = req.query.role;
    if (req.query.isSuspended) query.isSuspended = req.query.isSuspended === "true";

    const usersList = await User.find(query).skip(skip).limit(limit).lean();
    const total = await User.countDocuments(query);

    const usersWithWallets = [];
    for (const u of usersList) {
      const wallet = await Wallet.findOne({ userId: u._id });
      usersWithWallets.push({
        ...u,
        walletBalance: wallet || { utilityBalance: 0, earnedBalance: 0, lockedBalance: 0 },
      });
    }

    return res.status(200).json({
      success: true,
      users: usersWithWallets,
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

// PATCH /api/admin/users/:id/suspend
router.patch("/users/:id/suspend", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isSuspended = true;
    await user.save();

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/users/:id/unsuspend
router.patch("/users/:id/unsuspend", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isSuspended = false;
    await user.save();

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/transactions
router.get("/transactions", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.type) query.type = req.query.type;
    if (req.query.status) query.status = req.query.status;
    if (req.query.userId) query.userId = req.query.userId;

    const transactions = await WalletTransaction.find(query)
      .populate("userId", "username displayName profilePic")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await WalletTransaction.countDocuments(query);

    return res.status(200).json({
      success: true,
      transactions,
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

// GET /api/admin/abuse-flags
router.get("/abuse-flags", async (req, res) => {
  try {
    const query = { status: "PENDING" };
    const flags = await AbuseFlag.find(query).populate("userId", "username displayName profilePic");
    return res.status(200).json({ success: true, flags });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/abuse-flags/:id/approve
router.patch("/abuse-flags/:id/approve", async (req, res) => {
  try {
    const flag = await AbuseFlag.findById(req.params.id);
    if (!flag) return res.status(404).json({ error: "Abuse flag not found" });

    flag.status = "REVIEWED";
    await flag.save();

    const tx = await WalletTransaction.findById(flag.referenceId);
    if (tx && tx.status === "LOCKED") {
      tx.status = "COMPLETED";
      await tx.save();

      let wallet = await Wallet.findOne({ userId: flag.userId });
      if (!wallet) {
        wallet = await Wallet.create({ userId: flag.userId });
      }
      wallet.earnedBalance += tx.amount;
      wallet.totalEarned += tx.amount;
      await wallet.save();
    }

    return res.status(200).json({ success: true, flag });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/abuse-flags/:id/reject
router.patch("/abuse-flags/:id/reject", async (req, res) => {
  try {
    const flag = await AbuseFlag.findById(req.params.id);
    if (!flag) return res.status(404).json({ error: "Abuse flag not found" });

    flag.status = "ACTIONED";
    await flag.save();

    const tx = await WalletTransaction.findById(flag.referenceId);
    if (tx) {
      tx.status = "REJECTED";
      await tx.save();
    }

    return res.status(200).json({ success: true, flag });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/boosts
router.get("/boosts", async (req, res) => {
  try {
    const campaigns = await BoostCampaign.find({ status: "ACTIVE" }).populate("userId", "username displayName profilePic");
    return res.status(200).json({ success: true, boosts: campaigns });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/top-creators
router.get("/top-creators", async (req, res) => {
  try {
    const wallets = await Wallet.find({})
      .sort({ totalEarned: -1 })
      .limit(20)
      .populate("userId", "username displayName profilePic primaryRole");

    const topCreators = wallets.map((w, idx) => ({
      rank: idx + 1,
      user: w.userId,
      totalEarned: w.totalEarned,
      wallet: w,
    }));

    return res.status(200).json({ success: true, topCreators });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
