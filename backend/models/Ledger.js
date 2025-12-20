const mongoose = require('mongoose');

const LedgerSchema = new mongoose.Schema({
  ledger_name: {
    type: String,
    required: true,
  },
  ledger_type: {
    type: String,
    enum: ['theater', 'producer', 'bank', 'expense'],
    required: true,
  },
  associated_entity_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  associated_entity_name: {
    type: String,
    required: true,
  },
  starting_balance: {
    type: Number,
    default: 0,
  },
  starting_date: {
    type: Date,
  },
  current_balance: {
    type: Number,
    default: 0,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  last_entry_date: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('Ledger', LedgerSchema);
