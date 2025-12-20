const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  password_hash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'producer', 'exhibitor'],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  assigned_movie_id: {
    type: String, // Corresponds to MOV-2025-001
  },
  exhibitor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exhibitor',
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
  last_login: {
    type: Date,
  },
  preferences: {
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'IST' },
    notifications: { type: Boolean, default: true },
  },
}, { timestamps: true });

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password_hash);
};

module.exports = mongoose.model('User', UserSchema);
