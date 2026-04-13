const express = require('express');
const router = express.Router();
const { getDashboardAnalytics, exportCollectionsCSV, exportLedgerCSV } = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);

router.get('/dashboard', getDashboardAnalytics);
router.get('/export/collections', exportCollectionsCSV);
router.get('/export/ledger/:exhibitor_id', exportLedgerCSV);

module.exports = router;
