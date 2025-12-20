const Movie = require('../models/Movie');

// @desc    Create a new movie
// @route   POST /api/movies
// @access  Private (Admin)
const createMovie = async (req, res) => {
  const { title, release_date, genre, description } = req.body;

  // Validation
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }
  if (!release_date) {
    return res.status(400).json({ message: 'Release date is required' });
  }
  const releaseDate = new Date(release_date);
  if (releaseDate <= new Date()) {
    return res.status(400).json({ message: 'Release date must be in the future' });
  }

  try {
    const year = releaseDate.getFullYear();

    // Find all movies for this year to get the next sequence
    const moviesThisYear = await Movie.find({ movie_id: { $regex: `^MOV-${year}-` } });
    const sequences = moviesThisYear.map(movie => parseInt(movie.movie_id.split('-')[2]));
    const maxSeq = sequences.length > 0 ? Math.max(...sequences) : 0;
    const sequence = maxSeq + 1;
    const sequencePadded = sequence.toString().padStart(3, '0');
    const movie_id = `MOV-${year}-${sequencePadded}`;

    const movie = new Movie({
      movie_id,
      title,
      release_date: releaseDate,
      genre,
      description,
      created_by: req.user.id,
    });

    const createdMovie = await movie.save();
    res.status(201).json(createdMovie);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all movies
// @route   GET /api/movies
// @access  Private (Authenticated Users)
const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find({});
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get movie by ID
// @route   GET /api/movies/:id
// @access  Private (Authenticated Users)
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findOne({ $or: [{ _id: req.params.id }, { movie_id: req.params.id }] });
    if (movie) {
      res.json(movie);
    } else {
      res.status(404).json({ message: 'Movie not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update movie details
// @route   PUT /api/movies/:id
// @access  Private (Admin)
const updateMovie = async (req, res) => {
  const { title, release_date, genre, description, status } = req.body;

  try {
    const movie = await Movie.findOne({ $or: [{ _id: req.params.id }, { movie_id: req.params.id }] });

    if (movie) {
      movie.title = title || movie.title;
      movie.release_date = release_date || movie.release_date;
      movie.genre = genre || movie.genre;
      movie.description = description || movie.description;
      movie.status = status || movie.status;

      const updatedMovie = await movie.save();
      res.json(updatedMovie);
    } else {
      res.status(404).json({ message: 'Movie not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Soft delete movie
// @route   DELETE /api/movies/:id
// @access  Private (Admin)
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findOne({ $or: [{ _id: req.params.id }, { movie_id: req.params.id }] });

    if (movie) {
      movie.status = 'inactive';
      await movie.save();
      res.json({ message: 'Movie deleted successfully' });
    } else {
      res.status(404).json({ message: 'Movie not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { createMovie, getMovies, getMovieById, updateMovie, deleteMovie };
