const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Get all users (admin)
// @route   GET /api/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const { role, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password_hash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password_hash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new user (admin)
// @route   POST /api/users
// @access  Private (Admin)
const createUser = async (req, res) => {
  const { name, email, password, role, assigned_movie_id, exhibitor_id } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'name, email, password, and role are required' });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User with this email already exists' });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password_hash,
      role,
      assigned_movie_id,
      exhibitor_id,
      created_by: req.user._id,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      assigned_movie_id: user.assigned_movie_id,
      status: user.status,
      createdAt: user.createdAt,
      token: jwt.sign({ user_id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' }),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update user (admin)
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, role, assigned_movie_id, exhibitor_id, status } = req.body;

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.assigned_movie_id = assigned_movie_id !== undefined ? assigned_movie_id : user.assigned_movie_id;
    user.exhibitor_id = exhibitor_id !== undefined ? exhibitor_id : user.exhibitor_id;
    user.status = status || user.status;

    const updated = await user.save();
    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      status: updated.status,
      assigned_movie_id: updated.assigned_movie_id,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Deactivate/activate user
// @route   PUT /api/users/:id/toggle-status
// @access  Private (Admin)
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();

    res.json({ message: `User ${user.status === 'active' ? 'activated' : 'deactivated'}`, status: user.status });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Reset user password (admin generates temp password)
// @route   PUT /api/users/:id/reset-password
// @access  Private (Admin)
const resetPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const tempPassword = Math.random().toString(36).slice(-10);
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(tempPassword, salt);
    await user.save();

    res.json({ message: 'Password reset successfully', tempPassword });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get current user's own profile
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password_hash');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update current user's own profile (name, email, preferences)
// @route   PUT /api/users/me
// @access  Private (any authenticated user)
const updateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, preferences } = req.body;

    // Only allow updating safe fields — role/status changes still require admin
    if (name) user.name = name;
    if (email) {
      // Ensure email uniqueness
      const exists = await User.findOne({ email, _id: { $ne: user._id } });
      if (exists) return res.status(400).json({ message: 'Email already in use by another account' });
      user.email = email;
    }
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    const updated = await user.save();
    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      preferences: updated.preferences,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { getUsers, getUserById, createUser, updateUser, updateMe, toggleUserStatus, resetPassword, getMe };
