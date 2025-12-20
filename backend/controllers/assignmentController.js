const MovieExhibitorAssignment = require('../models/MovieExhibitorAssignment');
const Movie = require('../models/Movie');
const Exhibitor = require('../models/Exhibitor');

// @desc    Create movie-exhibitor assignments
// @route   POST /api/assignments
// @access  Private (Admin)
const createAssignments = async (req, res) => {
    const { movie_id, exhibitor_ids } = req.body;

    // Validation
    if (!movie_id) {
        return res.status(400).json({ message: 'Movie ID is required' });
    }
    if (!exhibitor_ids || !Array.isArray(exhibitor_ids) || exhibitor_ids.length === 0) {
        return res.status(400).json({ message: 'At least one exhibitor ID is required' });
    }

    try {
        // Validate movie exists
        const movie = await Movie.findOne({ $or: [{ _id: movie_id }, { movie_id }] });
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        // Validate exhibitors exist
        const exhibitors = await Exhibitor.find({ _id: { $in: exhibitor_ids } });
        if (exhibitors.length !== exhibitor_ids.length) {
            return res.status(404).json({ message: 'One or more exhibitors not found' });
        }

        // Create assignments
        const assignments = exhibitor_ids.map(exhibitor_id => ({
            movie_id: movie._id,
            exhibitor_id,
            status: 'active',
            assigned_date: new Date(),
        }));

        await MovieExhibitorAssignment.insertMany(assignments);

        res.status(201).json({
            success: true,
            message: `${assignments.length} assignments created successfully`,
            data: {
                assignments_created: assignments.length,
                movie_id: movie.movie_id,
                exhibitor_ids,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get assignments for a movie
// @route   GET /api/assignments/:movie_id
// @access  Private (Admin)
const getAssignmentsByMovie = async (req, res) => {
    const { movie_id } = req.params;

    try {
        const movie = await Movie.findOne({ $or: [{ _id: movie_id }, { movie_id }] });
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        const assignments = await MovieExhibitorAssignment.find({ movie_id: movie._id })
            .populate('exhibitor_id', 'name email theater_location')
            .sort({ assigned_date: -1 });

        res.json({
            success: true,
            data: assignments,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { createAssignments, getAssignmentsByMovie };
