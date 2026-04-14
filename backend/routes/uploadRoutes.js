const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { upload, uploadToR2, deleteFromR2 } = require('../utils/r2Upload');
const Movie = require('../models/Movie');
const path = require('path');

// @desc    Upload or replace a movie poster
// @route   POST /api/upload/movie/:movie_id/poster
// @access  Private (Admin)
router.post('/movie/:movie_id/poster', protect, admin, upload.single('poster'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { movie_id } = req.params;
    const movie = await Movie.findOne({ movie_id });

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Delete old poster from R2 if it exists
    if (movie.poster_url) {
      const oldKey = movie.poster_url.replace(`${process.env.R2_PUBLIC_URL}/`, '');
      try {
        await deleteFromR2(oldKey);
      } catch {
        // Non-fatal — old poster may have been already deleted
      }
    }

    // Build a unique key
    const ext = path.extname(req.file.originalname).toLowerCase() || '.jpg';
    const key = `posters/${movie_id}-${Date.now()}${ext}`;

    const posterUrl = await uploadToR2(req.file.buffer, key, req.file.mimetype);

    movie.poster_url = posterUrl;
    await movie.save();

    res.json({ message: 'Poster uploaded successfully', poster_url: posterUrl });
  } catch (error) {
    console.error('Poster upload error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @desc    Delete a movie poster
// @route   DELETE /api/upload/movie/:movie_id/poster
// @access  Private (Admin)
router.delete('/movie/:movie_id/poster', protect, admin, async (req, res) => {
  try {
    const { movie_id } = req.params;
    const movie = await Movie.findOne({ movie_id });

    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    if (!movie.poster_url) return res.status(400).json({ message: 'No poster to delete' });

    const key = movie.poster_url.replace(`${process.env.R2_PUBLIC_URL}/`, '');
    await deleteFromR2(key);

    movie.poster_url = null;
    await movie.save();

    res.json({ message: 'Poster deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
