const express = require('express');
const router = express.Router();
const { getUsers, getUserById, createUser, updateUser, toggleUserStatus, resetPassword, getMe } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);

// Current user profile (any authenticated user)
router.get('/me', getMe);

// Admin only routes
router.get('/', admin, getUsers);
router.post('/', admin, createUser);
router.get('/:id', admin, getUserById);
router.put('/:id', admin, updateUser);
router.put('/:id/toggle-status', admin, toggleUserStatus);
router.put('/:id/reset-password', admin, resetPassword);

module.exports = router;
