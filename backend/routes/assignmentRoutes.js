const express = require('express');
const router = express.Router();
const {
    createAssignments,
    getAssignmentsByMovie,
    getExhibitorAssignments,
    acceptMovieAgreement,
    getExhibitorStats,
} = require('../controllers/assignmentController');
const { protect, admin } = require('../middleware/authMiddleware');

// Exhibitor routes (protected but not admin-only)
router.get('/exhibitor/:exhibitor_id', protect, getExhibitorAssignments);
router.get('/exhibitor/:exhibitor_id/stats', protect, getExhibitorStats);
router.post('/:assignment_id/accept-agreement', protect, acceptMovieAgreement);

// Admin-only routes
router.use(protect, admin);

router.route('/')
    .post(createAssignments);

router.route('/:movie_id')
    .get(getAssignmentsByMovie);

module.exports = router;
