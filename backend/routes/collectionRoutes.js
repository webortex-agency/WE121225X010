const express = require('express');
const router = express.Router();
const {
  submitCollection,
  getAllCollections,
  getMyCollections,
  getCollectionsByMovie,
  getMovieAnalytics,
  getCollectionById,
  approveCollection,
  rejectCollection,
  getAdminStats,
} = require('../controllers/collectionController');
const { protect, admin, authorizeRole } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Admin stats
router.get('/admin/stats', admin, getAdminStats);

// Exhibitor: submit + view own
router.post('/', authorizeRole('exhibitor'), submitCollection);
router.get('/my', authorizeRole('exhibitor'), getMyCollections);

// Movie-specific (manager, producer, admin)
router.get('/movie/:movie_id/analytics', authorizeRole('manager', 'producer', 'admin'), getMovieAnalytics);
router.get('/movie/:movie_id', authorizeRole('manager', 'producer', 'admin'), getCollectionsByMovie);

// Admin: get all
router.get('/', admin, getAllCollections);

// Single collection
router.get('/:id', getCollectionById);

// Admin: approve / reject
router.put('/:id/approve', admin, approveCollection);
router.put('/:id/reject', admin, rejectCollection);

module.exports = router;
