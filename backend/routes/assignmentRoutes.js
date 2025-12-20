const express = require('express');
const router = express.Router();
const { createAssignments, getAssignmentsByMovie } = require('../controllers/assignmentController');
const { protect, admin } = require('../middleware/authMiddleware');

// All assignment routes are protected and admin-only
router.use(protect, admin);

router.route('/')
    .post(createAssignments);

router.route('/:movie_id')
    .get(getAssignmentsByMovie);

module.exports = router;
