const express = require('express');
const router = express.Router();
const { getMyLedger, getLedgerByExhibitor, getLedgerEntries } = require('../controllers/ledgerController');
const { protect, admin, authorizeRole } = require('../middleware/authMiddleware');

router.use(protect);

// Exhibitor: their own ledger
router.get('/my', authorizeRole('exhibitor'), getMyLedger);

// Admin: ledger by exhibitor
router.get('/:exhibitor_id/entries', admin, getLedgerEntries);
router.get('/:exhibitor_id', admin, getLedgerByExhibitor);

module.exports = router;
