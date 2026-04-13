const express = require('express');
const router = express.Router();
const {
  generateStatement,
  listStatements,
  downloadStatementPDF,
  getStatementById,
} = require('../controllers/closingStatementController');
const { protect, admin, authorizeRole } = require('../middleware/authMiddleware');

router.use(protect);

// Generate (admin only)
router.post('/generate', admin, generateStatement);

// List (admin, manager, producer)
router.get('/', authorizeRole('admin', 'manager', 'producer'), listStatements);

// Single + PDF download
router.get('/:id/pdf', authorizeRole('admin', 'manager', 'producer'), downloadStatementPDF);
router.get('/:id', authorizeRole('admin', 'manager', 'producer'), getStatementById);

module.exports = router;
