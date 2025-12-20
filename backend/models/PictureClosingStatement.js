const mongoose = require('mongoose');

const DayWiseDataSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  day_number: { type: Number, required: true },
  gross: { type: Number, required: true },
  expenses: { type: Number, required: true },
  net: { type: Number, required: true },
  theater_rent: { type: Number, required: true },
  share: { type: Number, required: true },
  shows: { type: Number },
  audience: { type: Number },
});

const PictureClosingStatementSchema = new mongoose.Schema({
  movie_id: {
    type: String,
    ref: 'Movie',
    required: true,
  },
  theater_name: {
    type: String,
    required: true,
  },
  date_from: {
    type: Date,
    required: true,
  },
  date_to: {
    type: Date,
    required: true,
  },
  day_wise_data: [DayWiseDataSchema],
  totals: {
    total_gross: { type: Number, default: 0 },
    total_expenses: { type: Number, default: 0 },
    total_net: { type: Number, default: 0 },
    total_theater_rent: { type: Number, default: 0 },
    total_share: { type: Number, default: 0 },
    gst_amount: { type: Number, default: 0 },
    total_payable: { type: Number, default: 0 },
  },
  weekly_summary: { type: Map, of: Number },
  generated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['generated', 'archived'],
    default: 'generated',
  },
}, { timestamps: { createdAt: 'generated_date' } });

module.exports = mongoose.model('PictureClosingStatement', PictureClosingStatementSchema);
