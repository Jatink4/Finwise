// server/routes/transactions.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authmiddle');
const Transaction = require('../models/transactionmodel');

// helper: simple fraud flags
async function evaluateFraud(userId, amount, merchant) {
  // example rules:
  // 1) if amount > 1,00,000 (hard threshold) => flag
  // 2) if amount > 3x average of last 30 days expenses => flag
  // 3) placeholder for merchant watchlist (expand later)
  const HARD_LIMIT = 100000; // tune later

  if (amount >= HARD_LIMIT) return { flagged: true, reason: 'amount > hard limit' };

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recent = await Transaction.find({ user: userId, type: 'expense', date: { $gte: thirtyDaysAgo } });
  const avg = recent.length ? recent.reduce((s, r) => s + r.amount, 0) / recent.length : 0;
  if (avg && amount > avg * 3) return { flagged: true, reason: 'amount > 3x avg 30d expense', avg };

  // merchant watchlist example:
  const watchlist = ['suspicious-merchant'];
  if (watchlist.includes((merchant||'').toLowerCase())) return { flagged: true, reason: 'merchant on watchlist' };

  return { flagged: false, reason: 'ok' };
}

// create transaction
router.post('/', auth, async (req, res) => {
  try {
    const { type, amount, category, merchant, date } = req.body;
    const userId = req.user.id;
    const evalRes = await evaluateFraud(userId, amount, merchant);

    const tx = await Transaction.create({
      user: userId,
      type,
      amount,
      category,
      merchant,
      date: date || new Date(),
      flagged: evalRes.flagged,
      meta: { fraudReason: evalRes.reason }
    });

    res.json(tx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// get all transactions for user
router.get('/', auth, async (req, res) => {
  try {
    const txs = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.json(txs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
