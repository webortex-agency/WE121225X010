const express = require('express');
const router = express.Router();
const { registerUser, loginUser, refreshToken } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
// @access  Private (Admin)
router.post('/register', protect, admin, registerUser);

// Test route to isolate the issue
router.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

// @route   POST /api/auth/login
// @access  Public
router.post('/login', loginUser);

// @route   POST /api/auth/refresh
// @access  Private
router.post('/refresh', protect, refreshToken);

module.exports = router;
