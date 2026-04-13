const DailyCollection = require('../models/DailyCollection');
const Exhibitor = require('../models/Exhibitor');
const Ledger = require('../models/Ledger');
const LedgerEntry = require('../models/LedgerEntry');
const MovieExhibitorAssignment = require('../models/MovieExhibitorAssignment');
const User = require('../models/User');
const { sendEmail, collectionApprovedEmail, collectionRejectedEmail, collectionSubmittedEmail } = require('./notificationController');

// Compute week info from a date
const getWeekInfo = (date) => {
  const d = new Date(date);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const day_name = dayNames[d.getDay()];

  // Week starts Monday
  const dow = d.getDay() === 0 ? 7 : d.getDay(); // 1=Mon, 7=Sun
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() - (dow - 1));
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  // Week number of the year
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const week_number = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);

  return { day_name, week_start: weekStart, week_end: weekEnd, week_number };
};

// @desc    Submit a daily collection
// @route   POST /api/collections
// @access  Private (Exhibitor)
const submitCollection = async (req, res) => {
  try {
    const { movie_id, date, shows, notes, weather, issues } = req.body;

    if (!movie_id || !date) {
      return res.status(400).json({ message: 'movie_id and date are required' });
    }

    // Verify exhibitor exists
    const exhibitor = await Exhibitor.findById(req.user.exhibitor_id);
    if (!exhibitor) {
      return res.status(403).json({ message: 'Exhibitor profile not found for this user' });
    }

    // Verify assignment
    const assignment = await MovieExhibitorAssignment.findOne({
      movie_id,
      exhibitor_id: exhibitor._id,
      status: 'active',
    });
    if (!assignment) {
      return res.status(403).json({ message: 'You are not assigned to this movie' });
    }

    // Check for duplicate submission on same date
    const existing = await DailyCollection.findOne({
      movie_id,
      exhibitor_id: exhibitor._id,
      date: new Date(date),
      status: { $ne: 'rejected' },
    });
    if (existing) {
      return res.status(409).json({ message: 'A collection for this date and movie already exists' });
    }

    const { day_name, week_start, week_end, week_number } = getWeekInfo(date);

    // Build shows with defaults
    const buildShow = (s) => ({
      collection: Number(s?.collection) || 0,
      occupancy: Number(s?.occupancy) || 0,
      ticket_rate: Number(s?.ticket_rate) || 0,
      ac_charge: Number(s?.ac_charge) || 0,
      count: Number(s?.count) || 1,
    });

    const builtShows = {
      matinee: buildShow(shows?.matinee),
      afternoon: buildShow(shows?.afternoon),
      first_show: buildShow(shows?.first_show),
      second_show: buildShow(shows?.second_show),
    };

    const totalCollection =
      builtShows.matinee.collection +
      builtShows.afternoon.collection +
      builtShows.first_show.collection +
      builtShows.second_show.collection;

    const totalShows =
      (builtShows.matinee.collection > 0 ? 1 : 0) +
      (builtShows.afternoon.collection > 0 ? 1 : 0) +
      (builtShows.first_show.collection > 0 ? 1 : 0) +
      (builtShows.second_show.collection > 0 ? 1 : 0);

    const totalAcCharges =
      builtShows.matinee.ac_charge +
      builtShows.afternoon.ac_charge +
      builtShows.first_show.ac_charge +
      builtShows.second_show.ac_charge;

    const net_collection = totalCollection - totalAcCharges;

    // edit window: 2 hours after submission
    const can_edit_until = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const collection = new DailyCollection({
      movie_id,
      exhibitor_id: exhibitor._id,
      theater_name: exhibitor.name,
      gst_number: exhibitor.gst_number || exhibitor.exhibitor_id || 'N/A',
      date: new Date(date),
      week_start,
      week_end,
      week_number,
      day_name,
      shows: builtShows,
      totals: {
        collection: totalCollection,
        total_shows: totalShows,
      },
      net_collection,
      notes,
      weather,
      issues,
      status: 'submitted',
      submitted_by: req.user._id,
      can_edit_until,
    });

    const saved = await collection.save();

    // Notify admin(s) of new submission
    try {
      const admins = await User.find({ role: 'admin', status: 'active' }).select('email');
      for (const admin of admins) {
        sendEmail({
          to: admin.email,
          subject: `New Collection Submitted — ${exhibitor.name}`,
          html: collectionSubmittedEmail(exhibitor.name, movie_id, new Date(date).toLocaleDateString('en-IN'), net_collection),
        });
      }
    } catch (_) {} // non-blocking

    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all collections (admin) with optional filters
// @route   GET /api/collections
// @access  Private (Admin)
const getAllCollections = async (req, res) => {
  try {
    const { status, movie_id, exhibitor_id, date_from, date_to, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (movie_id) query.movie_id = movie_id;
    if (exhibitor_id) query.exhibitor_id = exhibitor_id;
    if (date_from || date_to) {
      query.date = {};
      if (date_from) query.date.$gte = new Date(date_from);
      if (date_to) query.date.$lte = new Date(date_to);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await DailyCollection.countDocuments(query);
    const collections = await DailyCollection.find(query)
      .populate('exhibitor_id', 'name theater_location')
      .populate('submitted_by', 'name')
      .populate('approved_by', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ collections, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get own collections (exhibitor)
// @route   GET /api/collections/my
// @access  Private (Exhibitor)
const getMyCollections = async (req, res) => {
  try {
    const exhibitor = await Exhibitor.findById(req.user.exhibitor_id);
    if (!exhibitor) return res.status(403).json({ message: 'Exhibitor profile not found' });

    const { status, movie_id, page = 1, limit = 20 } = req.query;
    const query = { exhibitor_id: exhibitor._id };
    if (status && status !== 'all') query.status = status;
    if (movie_id) query.movie_id = movie_id;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await DailyCollection.countDocuments(query);
    const collections = await DailyCollection.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ collections, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get collections for a specific movie (manager/producer)
// @route   GET /api/collections/movie/:movie_id
// @access  Private (Manager, Producer, Admin)
const getCollectionsByMovie = async (req, res) => {
  try {
    const { movie_id } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const query = { movie_id };
    if (status && status !== 'all') query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await DailyCollection.countDocuments(query);
    const collections = await DailyCollection.find(query)
      .populate('exhibitor_id', 'name theater_location')
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ collections, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get analytics for a movie (manager/producer)
// @route   GET /api/collections/movie/:movie_id/analytics
// @access  Private (Manager, Producer, Admin)
const getMovieAnalytics = async (req, res) => {
  try {
    const { movie_id } = req.params;

    const allCollections = await DailyCollection.find({ movie_id, status: 'approved' })
      .populate('exhibitor_id', 'name theater_location')
      .sort({ date: 1 });

    const totalGross = allCollections.reduce((s, c) => s + c.totals.collection, 0);
    const totalNet = allCollections.reduce((s, c) => s + c.net_collection, 0);
    const totalShows = allCollections.reduce((s, c) => s + c.totals.total_shows, 0);

    // Daily trend
    const dailyTrend = allCollections.map((c) => ({
      date: c.date,
      day_name: c.day_name,
      gross: c.totals.collection,
      net: c.net_collection,
      theater: c.theater_name,
    }));

    // Per-theater summary
    const theaterMap = {};
    allCollections.forEach((c) => {
      const key = c.theater_name;
      if (!theaterMap[key]) {
        theaterMap[key] = { theater: key, location: c.exhibitor_id?.theater_location || '', gross: 0, net: 0, days: 0 };
      }
      theaterMap[key].gross += c.totals.collection;
      theaterMap[key].net += c.net_collection;
      theaterMap[key].days += 1;
    });
    const theaterSummary = Object.values(theaterMap).sort((a, b) => b.gross - a.gross);

    // Weekly summary
    const weekMap = {};
    allCollections.forEach((c) => {
      const key = `W${c.week_number}`;
      if (!weekMap[key]) weekMap[key] = { week: key, week_number: c.week_number, gross: 0, net: 0, days: 0 };
      weekMap[key].gross += c.totals.collection;
      weekMap[key].net += c.net_collection;
      weekMap[key].days += 1;
    });
    const weeklySummary = Object.values(weekMap).sort((a, b) => a.week_number - b.week_number);

    res.json({
      movie_id,
      totalGross,
      totalNet,
      totalShows,
      totalDays: allCollections.length,
      theaterCount: theaterSummary.length,
      dailyTrend,
      theaterSummary,
      weeklySummary,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get single collection by ID
// @route   GET /api/collections/:id
// @access  Private
const getCollectionById = async (req, res) => {
  try {
    const collection = await DailyCollection.findById(req.params.id)
      .populate('exhibitor_id', 'name theater_location email contact')
      .populate('submitted_by', 'name')
      .populate('approved_by', 'name');
    if (!collection) return res.status(404).json({ message: 'Collection not found' });
    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Helper: auto-generate ledger entry on approval
const createLedgerEntry = async (collection) => {
  try {
    // Find or create ledger for this exhibitor
    let ledger = await Ledger.findOne({
      associated_entity_id: collection.exhibitor_id,
      ledger_type: 'theater',
    });

    if (!ledger) {
      ledger = await Ledger.create({
        ledger_name: `${collection.theater_name} - Collections`,
        ledger_type: 'theater',
        associated_entity_id: collection.exhibitor_id,
        associated_entity_name: collection.theater_name,
        starting_balance: 0,
        starting_date: collection.date,
        current_balance: 0,
      });
    }

    const newBalance = ledger.current_balance + collection.net_collection;

    const entry = await LedgerEntry.create({
      ledger_id: ledger._id,
      date: collection.date,
      particulars: `Collection Approved - ${collection.movie_id} (${collection.day_name}, ${collection.date.toDateString()})`,
      credit: collection.net_collection,
      debit: 0,
      balance: newBalance,
      transaction_type: 'collection',
      source_id: collection._id,
      related_movie: collection.movie_id,
      related_theater: collection.theater_name,
    });

    // Update ledger balance
    await Ledger.findByIdAndUpdate(ledger._id, {
      current_balance: newBalance,
      last_entry_date: collection.date,
    });

    // Mark collection as having ledger entry
    await DailyCollection.findByIdAndUpdate(collection._id, {
      ledger_entry_created: true,
      ledger_entry_id: entry._id,
    });
  } catch (err) {
    console.error('Ledger entry creation failed:', err.message);
  }
};

// @desc    Approve a collection
// @route   PUT /api/collections/:id/approve
// @access  Private (Admin)
const approveCollection = async (req, res) => {
  try {
    const collection = await DailyCollection.findById(req.params.id);
    if (!collection) return res.status(404).json({ message: 'Collection not found' });

    if (collection.status === 'approved') {
      return res.status(400).json({ message: 'Collection is already approved' });
    }

    collection.status = 'approved';
    collection.approved_by = req.user._id;
    collection.approved_date = new Date();
    await collection.save();

    // Auto-generate ledger entry
    if (!collection.ledger_entry_created) {
      await createLedgerEntry(collection);
    }

    const updated = await DailyCollection.findById(req.params.id)
      .populate('exhibitor_id', 'name theater_location email')
      .populate('approved_by', 'name');

    // Notify exhibitor
    try {
      const exhibitorUser = await User.findOne({ exhibitor_id: collection.exhibitor_id, status: 'active' }).select('email');
      if (exhibitorUser?.email) {
        sendEmail({
          to: exhibitorUser.email,
          subject: `Collection Approved — ${collection.movie_id}`,
          html: collectionApprovedEmail(collection.theater_name, collection.movie_id, new Date(collection.date).toLocaleDateString('en-IN'), collection.net_collection),
        });
      }
    } catch (_) {}

    res.json({ message: 'Collection approved and ledger updated', collection: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Reject a collection
// @route   PUT /api/collections/:id/reject
// @access  Private (Admin)
const rejectCollection = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: 'Rejection reason is required' });

    const collection = await DailyCollection.findById(req.params.id);
    if (!collection) return res.status(404).json({ message: 'Collection not found' });

    collection.status = 'rejected';
    collection.notes = collection.notes
      ? `${collection.notes} | Rejection: ${reason}`
      : `Rejection: ${reason}`;
    await collection.save();

    // Notify exhibitor
    try {
      const exhibitorUser = await User.findOne({ exhibitor_id: collection.exhibitor_id, status: 'active' }).select('email');
      if (exhibitorUser?.email) {
        sendEmail({
          to: exhibitorUser.email,
          subject: `Collection Rejected — ${collection.movie_id}`,
          html: collectionRejectedEmail(collection.theater_name, collection.movie_id, new Date(collection.date).toLocaleDateString('en-IN'), reason),
        });
      }
    } catch (_) {}

    res.json({ message: 'Collection rejected', collection });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Admin dashboard stats
// @route   GET /api/collections/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
  try {
    const total = await DailyCollection.countDocuments();
    const pending = await DailyCollection.countDocuments({ status: { $in: ['submitted', 'pending'] } });
    const approved = await DailyCollection.countDocuments({ status: 'approved' });
    const rejected = await DailyCollection.countDocuments({ status: 'rejected' });

    const revenueAgg = await DailyCollection.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$net_collection' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Today's collections
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await DailyCollection.countDocuments({ createdAt: { $gte: today } });

    res.json({ total, pending, approved, rejected, totalRevenue, todayCount });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  submitCollection,
  getAllCollections,
  getMyCollections,
  getCollectionsByMovie,
  getMovieAnalytics,
  getCollectionById,
  approveCollection,
  rejectCollection,
  getAdminStats,
};
