// server/models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['income','expense'], required: true },
  amount: { type: Number, required: true },
  category: { type: String },
  merchant: { type: String },
  date: { type: Date, default: Date.now },
  flagged: { type: Boolean, default: false }, // for fraud
  meta: { type: Object, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
