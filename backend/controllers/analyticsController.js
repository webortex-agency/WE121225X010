const DailyCollection = require('../models/DailyCollection');
const Movie = require('../models/Movie');
const Exhibitor = require('../models/Exhibitor');
const Ledger = require('../models/Ledger');

/**
 * Build a date-range match from period string or explicit dates.
 */
const buildDateMatch = (period, dateFrom, dateTo) => {
  const now = new Date();
  if (dateFrom && dateTo) {
    return { $gte: new Date(dateFrom), $lte: new Date(dateTo) };
  }
  switch (period) {
    case 'thisWeek': {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      return { $gte: start, $lte: now };
    }
    case 'thisMonth': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { $gte: start, $lte: now };
    }
    case 'thisQuarter': {
      const q = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), q * 3, 1);
      return { $gte: start, $lte: now };
    }
    case 'thisYear': {
      const start = new Date(now.getFullYear(), 0, 1);
      return { $gte: start, $lte: now };
    }
    default: {
      // last 30 days
      const start = new Date(now);
      start.setDate(now.getDate() - 30);
      return { $gte: start, $lte: now };
    }
  }
};

// @desc    Full analytics dashboard data
// @route   GET /api/analytics/dashboard
// @access  Private (Admin)
const getDashboardAnalytics = async (req, res) => {
  try {
    const { period = 'thisMonth', dateFrom, dateTo } = req.query;
    const dateMatch = buildDateMatch(period, dateFrom, dateTo);

    const [
      totalMovies,
      totalExhibitors,
      allCollections,
      approvedCollections,
      revenueTrend,
      topMovies,
      topExhibitors,
      statusDist,
    ] = await Promise.all([
      Movie.countDocuments({ status: 'active' }),
      Exhibitor.countDocuments({ status: 'active' }),

      // All collections in period
      DailyCollection.aggregate([
        { $match: { date: dateMatch } },
        { $group: { _id: null, total: { $sum: 1 }, submitted: { $sum: { $cond: [{ $in: ['$status', ['submitted', 'pending']] }, 1, 0] } }, approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } }, rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } } } },
      ]),

      // Revenue from approved
      DailyCollection.aggregate([
        { $match: { date: dateMatch, status: 'approved' } },
        { $group: { _id: null, totalRevenue: { $sum: '$net_collection' }, avgValue: { $avg: '$net_collection' } } },
      ]),

      // Revenue trend (daily)
      DailyCollection.aggregate([
        { $match: { date: dateMatch, status: 'approved' } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, amount: { $sum: '$net_collection' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', amount: 1, count: 1 } },
      ]),

      // Top movies by collection
      DailyCollection.aggregate([
        { $match: { date: dateMatch, status: 'approved' } },
        { $group: { _id: '$movie_id', amount: { $sum: '$net_collection' }, days: { $sum: 1 }, theaters: { $addToSet: '$theater_name' } } },
        { $sort: { amount: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, name: '$_id', movieId: '$_id', amount: 1, days: 1, theaterCount: { $size: '$theaters' } } },
      ]),

      // Top exhibitors by collection
      DailyCollection.aggregate([
        { $match: { date: dateMatch, status: 'approved' } },
        { $group: { _id: '$theater_name', amount: { $sum: '$net_collection' }, exhibitorId: { $first: '$exhibitor_id' }, days: { $sum: 1 } } },
        { $sort: { amount: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, name: '$_id', amount: 1, days: 1 } },
      ]),

      // Status distribution
      DailyCollection.aggregate([
        { $match: { date: dateMatch } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { _id: 0, status: '$_id', count: 1 } },
      ]),
    ]);

    const totalCount = allCollections[0]?.total || 0;
    const approvedCount = allCollections[0]?.approved || 0;
    const totalRevenue = approvedCollections[0]?.totalRevenue || 0;
    const avgCollectionValue = approvedCollections[0]?.avgValue || 0;
    const approvalRate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

    res.json({
      metrics: {
        totalRevenue,
        totalCollections: totalCount,
        activeMovies: totalMovies,
        activeExhibitors: totalExhibitors,
        approvalRate,
        avgCollectionValue: Math.round(avgCollectionValue),
        pendingCount: allCollections[0]?.submitted || 0,
        rejectedCount: allCollections[0]?.rejected || 0,
      },
      chartData: {
        revenueTrend,
        topMovies,
        topExhibitors,
        statusDistribution: statusDist,
        dailySummary: revenueTrend,
      },
      period,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get analytics CSV export data
// @route   GET /api/analytics/export/collections
// @access  Private (Admin)
const exportCollectionsCSV = async (req, res) => {
  try {
    const { period = 'thisMonth', dateFrom, dateTo, status } = req.query;
    const dateMatch = buildDateMatch(period, dateFrom, dateTo);

    const query = { date: dateMatch };
    if (status && status !== 'all') query.status = status;

    const collections = await DailyCollection.find(query)
      .populate('exhibitor_id', 'name theater_location')
      .populate('submitted_by', 'name')
      .populate('approved_by', 'name')
      .sort({ date: -1 });

    const headers = [
      'Date', 'Day', 'Week', 'Movie ID', 'Theater', 'Location',
      'Matinee (₹)', 'Afternoon (₹)', 'First Show (₹)', 'Second Show (₹)',
      'Gross (₹)', 'Net (₹)', 'Status', 'Submitted By', 'Approved By', 'Notes'
    ];

    const rows = collections.map((c) => [
      c.date ? new Date(c.date).toLocaleDateString('en-IN') : '',
      c.day_name || '',
      `W${c.week_number || ''}`,
      c.movie_id || '',
      `"${c.theater_name || ''}"`,
      `"${c.exhibitor_id?.theater_location || ''}"`,
      c.shows?.matinee?.collection || 0,
      c.shows?.afternoon?.collection || 0,
      c.shows?.first_show?.collection || 0,
      c.shows?.second_show?.collection || 0,
      c.totals?.collection || 0,
      c.net_collection || 0,
      c.status || '',
      `"${c.submitted_by?.name || ''}"`,
      `"${c.approved_by?.name || ''}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="collections_${period}_${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Export ledger as CSV
// @route   GET /api/analytics/export/ledger/:exhibitor_id
// @access  Private (Admin)
const exportLedgerCSV = async (req, res) => {
  try {
    const LedgerEntry = require('../models/LedgerEntry');
    const Ledger = require('../models/Ledger');

    const ledger = await Ledger.findOne({ associated_entity_id: req.params.exhibitor_id });
    if (!ledger) return res.status(404).json({ message: 'Ledger not found' });

    const entries = await LedgerEntry.find({ ledger_id: ledger._id }).sort({ date: 1 });

    const headers = ['Date', 'Particulars', 'Debit (₹)', 'Credit (₹)', 'Balance (₹)', 'Type', 'Movie', 'Theater', 'Reconciled'];
    const rows = entries.map((e) => [
      e.date ? new Date(e.date).toLocaleDateString('en-IN') : '',
      `"${(e.particulars || '').replace(/"/g, '""')}"`,
      e.debit || 0,
      e.credit || 0,
      e.balance || 0,
      e.transaction_type || '',
      e.related_movie || '',
      `"${(e.related_theater || '').replace(/"/g, '""')}"`,
      e.is_reconciled ? 'Yes' : 'No',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="ledger_${ledger.associated_entity_name}_${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { getDashboardAnalytics, exportCollectionsCSV, exportLedgerCSV };
