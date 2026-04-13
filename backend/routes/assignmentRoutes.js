const express = require('express');
const router = express.Router();
const { createAssignments, getAssignmentsByMovie, removeAssignment, getAssignmentsByExhibitor } = require('../controllers/assignmentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);

router.route('/').post(createAssignments);
router.route('/exhibitor/:exhibitor_id').get(getAssignmentsByExhibitor);
router.route('/:assignment_id').delete(removeAssignment);
router.route('/movie/:movie_id').get(getAssignmentsByMovie);

module.exports = router;
