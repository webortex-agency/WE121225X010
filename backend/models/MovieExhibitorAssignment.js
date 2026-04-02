const mongoose = require('mongoose');

const MovieExhibitorAssignmentSchema = new mongoose.Schema({
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
  assigned_date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'removed'],
    default: 'active',
  },
  removed_date: {
    type: Date,
  },
  notes: {
    type: String,
  },
  agreement_accepted: {
    type: Boolean,
    default: false,
  },
  agreement_accepted_date: {
    type: Date,
  },
  agreement_version: {
    type: String,
    default: 'v1.0',
  },
}, { timestamps: true });

module.exports = mongoose.model('MovieExhibitorAssignment', MovieExhibitorAssignmentSchema);
