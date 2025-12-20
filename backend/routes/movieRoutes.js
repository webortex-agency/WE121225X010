const express = require('express');
const router = express.Router();
const {
  createMovie,
  getMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
} = require('../controllers/movieController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

router.route('/')
  .post(admin, createMovie) // Only admin can create
  .get(getMovies); // All authenticated users can view

router.route('/:id')
  .get(getMovieById) // All authenticated users can view
  .put(admin, updateMovie) // Only admin can update
  .delete(admin, deleteMovie); // Only admin can delete

module.exports = router;
