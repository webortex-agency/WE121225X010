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

// @desc    Get assignments for an exhibitor
// @route   GET /api/assignments/exhibitor/:exhibitor_id
// @access  Private (Exhibitor)
const getExhibitorAssignments = async (req, res) => {
    const { exhibitor_id } = req.params;

    try {
        const assignments = await MovieExhibitorAssignment.find({
            exhibitor_id,
            status: 'active'
        })
            .populate('movie_id', 'title release_date genre description')
            .sort({ assigned_date: -1 });

        res.json({
            success: true,
            data: assignments,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Accept movie agreement
// @route   POST /api/assignments/:assignment_id/accept-agreement
// @access  Private (Exhibitor)
const acceptMovieAgreement = async (req, res) => {
    const { assignment_id } = req.params;
    const { agreement_version } = req.body;

    try {
        const assignment = await MovieExhibitorAssignment.findById(assignment_id);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        if (assignment.agreement_accepted) {
            return res.status(400).json({ message: 'Agreement already accepted' });
        }

        assignment.agreement_accepted = true;
        assignment.agreement_accepted_date = new Date();
        assignment.agreement_version = agreement_version || 'v1.0';

        await assignment.save();

        // Populate movie_id before returning
        await assignment.populate('movie_id', 'title release_date genre description');

        res.json({
            success: true,
            message: 'Agreement accepted successfully',
            data: assignment,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get exhibitor statistics
// @route   GET /api/assignments/exhibitor/:exhibitor_id/stats
// @access  Private (Exhibitor)
const getExhibitorStats = async (req, res) => {
    const { exhibitor_id } = req.params;

    try {
        // Get active movies count
        const activeMoviesCount = await MovieExhibitorAssignment.countDocuments({
            exhibitor_id,
            status: 'active',
            agreement_accepted: true,
        });

        // Get previous day collections (you'll need to import DailyCollection model)
        const DailyCollection = require('../models/DailyCollection');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setHours(23, 59, 59, 999);

        const yesterdayCollections = await DailyCollection.find({
            exhibitor_id,
            date: { $gte: yesterday, $lte: yesterdayEnd },
        });

        const previousDayCollection = yesterdayCollections.reduce(
            (sum, col) => sum + (col.totals?.collection || 0),
            0
        );

        // Calculate tickets sold (approximate from collections)
        const ticketsSold = yesterdayCollections.reduce(
            (sum, col) => sum + (col.totals?.total_shows || 0) * 100, // Approximate
            0
        );

        // Get pending approvals count
        const pendingApprovals = await DailyCollection.countDocuments({
            exhibitor_id,
            status: 'submitted',
        });

        res.json({
            success: true,
            data: {
                active_movies: activeMoviesCount,
                previous_day_collection: previousDayCollection,
                tickets_sold: ticketsSold,
                pending_approvals: pendingApprovals,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    createAssignments,
    getAssignmentsByMovie,
    getExhibitorAssignments,
    acceptMovieAgreement,
    getExhibitorStats,
};
