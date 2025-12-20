const mongoose = require('mongoose');

const LedgerEntrySchema = new mongoose.Schema({
  ledger_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ledger',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  particulars: {
    type: String,
    required: true,
  },
  debit: {
    type: Number,
    default: 0,
  },
  credit: {
    type: Number,
    default: 0,
  },
  balance: {
    type: Number,
    required: true,
  },
  transaction_type: {
    type: String,
    enum: ['collection', 'payment', 'adjustment', 'opening'],
    required: true,
  },
  source_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  related_movie: {
    type: String,
  },
  related_theater: {
    type: String,
  },
  notes: {
    type: String,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  is_reconciled: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('LedgerEntry', LedgerEntrySchema);
