const mongoose = require('mongoose');

const ExhibitorSchema = new mongoose.Schema({
  exhibitor_id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  theater_location: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  login_credentials: {
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    created_date: { type: Date, default: Date.now },
    last_login: { type: Date },
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
}, { timestamps: true });

module.exports = mongoose.model('Exhibitor', ExhibitorSchema);
