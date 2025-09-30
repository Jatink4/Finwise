// server/routes/portfolio.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authmiddle');
const Holding = require('../models/portfoliomodel');
const axios = require('axios');

// helper to fetch latest price via Alpha Vantage (GLOBAL_QUOTE)
async function fetchPrice(ticker) {
  const key = process.env.ALPHA_VANTAGE_KEY;
  if (!key) throw new Error('No ALPHA_VANTAGE_KEY in env');
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(ticker)}&apikey=${key}`;
  const r = await axios.get(url);
  // safe parse
  const data = r.data?.['Global Quote'] || r.data?.['Global quote'] || {};
  const price = data['05. price'] || data['05. Price'] || null;
  return price ? parseFloat(price) : null;
}

// add holding
router.post('/', auth, async (req, res) => {
  try {
    const { ticker, quantity, buyPrice, buyDate } = req.body;
    const userId = req.user.id;
    const hold = await Holding.create({ user: userId, ticker: ticker.toUpperCase(), quantity, buyPrice, buyDate });
    res.json(hold);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// get holdings + fetch current market value
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const holdings = await Holding.find({ user: userId });

    // fetch current prices (sequentially to avoid API throttle — we will cache later)
    const enriched = [];
    for (const h of holdings) {
      let price = null;
      try { price = await fetchPrice(h.ticker); } catch (e) { console.warn('price fetch failed', h.ticker, e.message); }
      enriched.push({
        id: h._id,
        ticker: h.ticker,
        quantity: h.quantity,
        buyPrice: h.buyPrice,
        buyDate: h.buyDate,
        currentPrice: price,
        currentValue: price ? price * h.quantity : null,
        pnl: price ? (price - h.buyPrice) * h.quantity : null
      });
    }
    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
