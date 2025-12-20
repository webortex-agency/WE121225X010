const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ user_id: id }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Private (Admin)
const registerUser = async (req, res) => {
  const { name, email, password, role, assigned_movie_id, exhibitor_id } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password_hash,
      role,
      assigned_movie_id,
      exhibitor_id,
      created_by: req.user.id, // Assumes admin is logged in
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password, movie_id } = req.body;

  // Step 1: Validate Input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const user = await User.findOne({ email: email, status: 'active' });

    if (!user) {
      return res.status(401).json({ error: 'Account not found or inactive' });
    }

    // Step 3: Verify Password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Step 4: CRITICAL: For Manager/Producer - Verify Movie ID
    if (user.role === 'manager' || user.role === 'producer') {
      if (!movie_id) {
        return res.status(400).json({ error: 'Movie ID required for your role' });
      }
      if (user.assigned_movie_id !== movie_id) {
        return res.status(403).json({
          error: 'You are not assigned to this movie',
          your_movie: user.assigned_movie_id,
          requested_movie: movie_id,
        });
      }
    }

    // Step 5: Generate JWT Token
    const payload = {
      user_id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      assigned_movie_id: user.assigned_movie_id || null,
      exhibitor_id: user.exhibitor_id || null,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    user.last_login = Date.now();
    await user.save();

    // Step 7: Build Response
    const responsePayload = {
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        assigned_movie_id: user.assigned_movie_id,
      },
    };

    res.status(200).json(responsePayload);

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Refresh JWT token
// @route   POST /api/auth/refresh
// @access  Private
const refreshToken = async (req, res) => {
  try {
    // The protect middleware already verified the token and set req.user
    const user = req.user;

    // Generate new token with fresh expiry
    const payload = {
      user_id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      assigned_movie_id: user.assigned_movie_id || null,
      exhibitor_id: user.exhibitor_id || null,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        assigned_movie_id: user.assigned_movie_id,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { registerUser, loginUser, refreshToken };
