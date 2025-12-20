const express = require('express');
const router = express.Router();
const {
  createExhibitor,
  getExhibitors,
  updateExhibitor,
  deleteExhibitor,
} = require('../controllers/exhibitorController');
const { protect, admin } = require('../middleware/authMiddleware');

// All exhibitor routes are protected and admin-only
router.use(protect, admin);

router.route('/')
  .post(createExhibitor)
  .get(getExhibitors);

router.route('/:id')
  .put(updateExhibitor)
  .delete(deleteExhibitor);

module.exports = router;
