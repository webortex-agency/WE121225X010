const express = require('express');
const router = express.Router();
const { sendTestEmail } = require('../controllers/notificationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);
router.post('/test', sendTestEmail);

module.exports = router;
