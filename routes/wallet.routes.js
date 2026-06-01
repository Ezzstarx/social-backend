const express = require("express");
const router = express.Router();
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const requireAuth = require("../middleware/requireAuth");

// GET /api/wallet/me
router.get("/me", requireAuth, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({ userId: req.user._id });
    }
    return res.status(200).json({ success: true, wallet });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/wallet/transactions
router.get("/transactions", requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id };
    if (req.query.type) {
      filter.type = req.query.type;
    }

    const transactions = await WalletTransaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await WalletTransaction.countDocuments(filter);

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

module.exports = router;
