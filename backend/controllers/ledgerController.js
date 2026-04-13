const Ledger = require('../models/Ledger');
const LedgerEntry = require('../models/LedgerEntry');
const Exhibitor = require('../models/Exhibitor');

// @desc    Get ledger for the logged-in exhibitor
// @route   GET /api/ledger/my
// @access  Private (Exhibitor)
const getMyLedger = async (req, res) => {
  try {
    const exhibitor = await Exhibitor.findById(req.user.exhibitor_id);
    if (!exhibitor) return res.status(403).json({ message: 'Exhibitor profile not found' });

    const ledger = await Ledger.findOne({
      associated_entity_id: exhibitor._id,
      ledger_type: 'theater',
    });

    if (!ledger) {
      return res.json({
        ledger: null,
        entries: [],
        summary: { totalCredits: 0, totalDebits: 0, currentBalance: 0, entryCount: 0 },
      });
    }

    const entries = await LedgerEntry.find({ ledger_id: ledger._id }).sort({ date: -1 }).limit(50);

    const totalCredits = entries.reduce((s, e) => s + e.credit, 0);
    const totalDebits = entries.reduce((s, e) => s + e.debit, 0);

    res.json({
      ledger,
      entries,
      summary: {
        totalCredits,
        totalDebits,
        currentBalance: ledger.current_balance,
        entryCount: entries.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get ledger for a specific exhibitor (admin)
// @route   GET /api/ledger/:exhibitor_id
// @access  Private (Admin)
const getLedgerByExhibitor = async (req, res) => {
  try {
    const ledger = await Ledger.findOne({
      associated_entity_id: req.params.exhibitor_id,
      ledger_type: 'theater',
    });

    if (!ledger) return res.json({ ledger: null, entries: [] });

    const entries = await LedgerEntry.find({ ledger_id: ledger._id })
      .sort({ date: -1 })
      .limit(100);

    res.json({ ledger, entries });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all ledger entries for a ledger
// @route   GET /api/ledger/:exhibitor_id/entries
// @access  Private (Admin, Exhibitor)
const getLedgerEntries = async (req, res) => {
  try {
    const ledger = await Ledger.findOne({
      associated_entity_id: req.params.exhibitor_id,
    });

    if (!ledger) return res.json({ entries: [] });

    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await LedgerEntry.countDocuments({ ledger_id: ledger._id });
    const entries = await LedgerEntry.find({ ledger_id: ledger._id })
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ entries, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { getMyLedger, getLedgerByExhibitor, getLedgerEntries };
