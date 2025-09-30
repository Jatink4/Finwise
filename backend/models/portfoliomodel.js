// server/models/Portfolio.js
const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ticker: { type: String, required: true },
  quantity: { type: Number, required: true },
  buyPrice: { type: Number, required: true },
  buyDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Holding', holdingSchema);
