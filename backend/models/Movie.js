const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  movie_id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  release_date: {
    type: Date,
    required: true,
  },
  genre: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Revenue sharing configuration (percentages)
  revenue_sharing: {
    distributor_percent: { type: Number, default: 60 },
    exhibitor_percent: { type: Number, default: 40 },
  },
  budget: { type: Number, default: 0 },
  language: { type: String, default: 'Hindi' },
  poster_url: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Movie', MovieSchema);
