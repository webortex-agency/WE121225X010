const mongoose = require('mongoose');

const ShowSchema = new mongoose.Schema({
  collection: { type: Number, required: true, default: 0 },
  occupancy: { type: Number, required: true, default: 0 },
  ticket_rate: { type: Number, required: true, default: 0 },
  ac_charge: { type: Number, default: 0 },
  count: { type: Number, required: true, default: 1 },
});

const DailyCollectionSchema = new mongoose.Schema({
  movie_id: {
    type: String,
    ref: 'Movie',
    required: true,
  },
  exhibitor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exhibitor',
    required: true,
  },
  theater_name: { type: String, required: true }, // Denormalized
  gst_number: { type: String, required: true }, // Denormalized
  date: {
    type: Date,
    required: true,
  },
  week_start: { type: Date, required: true },
  week_end: { type: Date, required: true },
  week_number: { type: Number, required: true },
  day_name: { type: String, required: true },

  shows: {
    matinee: ShowSchema,
    afternoon: ShowSchema,
    first_show: ShowSchema,
    second_show: ShowSchema,
  },

  totals: {
    collection: { type: Number, default: 0 },
    occupancy_avg: { type: Number, default: 0 },
    total_shows: { type: Number, default: 0 },
  },

  expenses: {
    staff: { type: Number, default: 0 },
    maintenance: { type: Number, default: 0 },
    supplies: { type: Number, default: 0 },
    ac_charges: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },

  net_collection: { type: Number, default: 0 },

  notes: { type: String },
  weather: { type: String },
  issues: { type: String },

  status: {
    type: String,
    enum: ['submitted', 'pending', 'approved', 'rejected'],
    default: 'submitted',
  },
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approved_date: { type: Date },

  can_edit_until: { type: Date },
  submitted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  ledger_entry_created: { type: Boolean, default: false },
  ledger_entry_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LedgerEntry',
  },
}, { timestamps: true });

module.exports = mongoose.model('DailyCollection', DailyCollectionSchema);
