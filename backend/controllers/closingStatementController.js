const PDFDocument = require('pdfkit');
const DailyCollection = require('../models/DailyCollection');
const PictureClosingStatement = require('../models/PictureClosingStatement');
const Movie = require('../models/Movie');

// Helper: format Indian currency
const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

// @desc    Generate closing statement from approved collections
// @route   POST /api/statements/generate
// @access  Private (Admin)
const generateStatement = async (req, res) => {
  try {
    const { movie_id, theater_name, date_from, date_to } = req.body;

    if (!movie_id || !theater_name || !date_from || !date_to) {
      return res.status(400).json({ message: 'movie_id, theater_name, date_from, date_to are required' });
    }

    const movie = await Movie.findOne({ movie_id });
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    // Fetch approved collections for this movie + theater in date range
    const collections = await DailyCollection.find({
      movie_id,
      theater_name,
      status: 'approved',
      date: { $gte: new Date(date_from), $lte: new Date(date_to) },
    }).sort({ date: 1 });

    if (collections.length === 0) {
      return res.status(404).json({ message: 'No approved collections found for the given criteria' });
    }

    // Build day-wise data
    const day_wise_data = collections.map((c, i) => ({
      date: c.date,
      day_number: i + 1,
      gross: c.totals.collection,
      expenses: c.expenses?.total || 0,
      net: c.net_collection,
      theater_rent: 0, // can be enhanced later
      share: Math.round(c.net_collection * 0.5), // 50% share by default
      shows: c.totals.total_shows,
      audience: 0,
    }));

    const total_gross = day_wise_data.reduce((s, d) => s + d.gross, 0);
    const total_expenses = day_wise_data.reduce((s, d) => s + d.expenses, 0);
    const total_net = day_wise_data.reduce((s, d) => s + d.net, 0);
    const total_theater_rent = day_wise_data.reduce((s, d) => s + d.theater_rent, 0);
    const total_share = day_wise_data.reduce((s, d) => s + d.share, 0);
    const gst_amount = Math.round(total_net * 0.18);
    const total_payable = total_net - gst_amount;

    const statement = await PictureClosingStatement.create({
      movie_id,
      theater_name,
      date_from: new Date(date_from),
      date_to: new Date(date_to),
      day_wise_data,
      totals: {
        total_gross,
        total_expenses,
        total_net,
        total_theater_rent,
        total_share,
        gst_amount,
        total_payable,
      },
      generated_by: req.user._id,
    });

    res.status(201).json({ message: 'Statement generated', statement });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    List all closing statements
// @route   GET /api/statements
// @access  Private (Admin, Manager, Producer)
const listStatements = async (req, res) => {
  try {
    const { movie_id, page = 1, limit = 20 } = req.query;
    const query = {};

    if (movie_id) query.movie_id = movie_id;

    // For manager/producer, restrict to their assigned movie
    if (req.user.role === 'manager' || req.user.role === 'producer') {
      query.movie_id = req.user.assigned_movie_id;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await PictureClosingStatement.countDocuments(query);
    const statements = await PictureClosingStatement.find(query)
      .populate('generated_by', 'name')
      .sort({ generated_date: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ statements, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Download closing statement as PDF
// @route   GET /api/statements/:id/pdf
// @access  Private
const downloadStatementPDF = async (req, res) => {
  try {
    const statement = await PictureClosingStatement.findById(req.params.id).populate('generated_by', 'name');
    if (!statement) return res.status(404).json({ message: 'Statement not found' });

    const movie = await Movie.findOne({ movie_id: statement.movie_id });

    // Build PDF
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const filename = `PCS-${statement.movie_id}-${statement.theater_name.replace(/\s+/g, '_')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    const pageWidth = doc.page.width - 80; // account for margins

    // ── Header ──────────────────────────────────────────────────────────────
    doc.fontSize(18).font('Helvetica-Bold').text('PICTURE CLOSING STATEMENT', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica').text('(As per Industry Agreement)', { align: 'center' });
    doc.moveDown(0.5);

    // Horizontal rule
    doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
    doc.moveDown(0.5);

    // ── Movie & Theater Info ────────────────────────────────────────────────
    const infoLeft = 40;
    const infoRight = doc.page.width / 2;

    doc.fontSize(10).font('Helvetica-Bold').text('MOVIE DETAILS', infoLeft, doc.y);
    doc.font('Helvetica')
      .text(`Movie: ${movie?.title || statement.movie_id}`, infoLeft)
      .text(`Movie ID: ${statement.movie_id}`, infoLeft)
      .text(`Genre: ${movie?.genre || 'N/A'}`, infoLeft)
      .text(`Release Date: ${movie?.release_date ? new Date(movie.release_date).toLocaleDateString('en-IN') : 'N/A'}`, infoLeft);

    const detailsY = doc.y - 60;
    doc.fontSize(10).font('Helvetica-Bold').text('THEATER DETAILS', infoRight, detailsY);
    doc.font('Helvetica')
      .text(`Theater: ${statement.theater_name}`, infoRight, doc.y - 48)
      .text(`Period: ${new Date(statement.date_from).toLocaleDateString('en-IN')} – ${new Date(statement.date_to).toLocaleDateString('en-IN')}`, infoRight)
      .text(`Generated By: ${statement.generated_by?.name || 'Admin'}`, infoRight)
      .text(`Generated On: ${new Date(statement.generated_date).toLocaleDateString('en-IN')}`, infoRight);

    doc.moveDown(1);
    doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
    doc.moveDown(0.5);

    // ── Day-wise Table ───────────────────────────────────────────────────────
    doc.fontSize(11).font('Helvetica-Bold').text('DAY-WISE COLLECTION DETAILS', { align: 'center' });
    doc.moveDown(0.4);

    const colWidths = [30, 70, 55, 55, 55, 55, 60, 60];
    const headers = ['Day', 'Date', 'Shows', 'Gross (₹)', 'Expenses', 'Net (₹)', 'Rent (₹)', 'Share (₹)'];
    const colX = colWidths.reduce((acc, w, i) => { acc.push((acc[i - 1] || 40) + (colWidths[i - 1] || 0)); return acc; }, [40]);

    // Table header row
    const headerY = doc.y;
    doc.rect(40, headerY, pageWidth, 16).fill('#1a1a2e');
    headers.forEach((h, i) => {
      doc.fillColor('white').fontSize(8).font('Helvetica-Bold')
        .text(h, colX[i] + 2, headerY + 4, { width: colWidths[i] - 4, align: 'center' });
    });
    doc.fillColor('black');
    doc.moveDown(0.1);

    let rowY = headerY + 18;
    statement.day_wise_data.forEach((day, idx) => {
      if (rowY > doc.page.height - 100) {
        doc.addPage();
        rowY = 40;
      }
      const fill = idx % 2 === 0 ? '#f8f9fa' : 'white';
      doc.rect(40, rowY, pageWidth, 14).fill(fill);

      const row = [
        String(day.day_number),
        new Date(day.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        String(day.shows || 0),
        formatINR(day.gross).replace('₹', ''),
        formatINR(day.expenses).replace('₹', ''),
        formatINR(day.net).replace('₹', ''),
        formatINR(day.theater_rent).replace('₹', ''),
        formatINR(day.share).replace('₹', ''),
      ];

      row.forEach((cell, i) => {
        doc.fillColor('#333').fontSize(8).font('Helvetica')
          .text(cell, colX[i] + 2, rowY + 3, { width: colWidths[i] - 4, align: 'center' });
      });

      rowY += 14;
    });

    // Border around table
    doc.rect(40, headerY, pageWidth, rowY - headerY).stroke();

    doc.y = rowY + 8;
    doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
    doc.moveDown(0.5);

    // ── Totals Summary ───────────────────────────────────────────────────────
    doc.fontSize(11).font('Helvetica-Bold').text('FINANCIAL SUMMARY', { align: 'center' });
    doc.moveDown(0.4);

    const summaryItems = [
      ['Total Gross Collection', formatINR(statement.totals.total_gross)],
      ['Total Expenses', `- ${formatINR(statement.totals.total_expenses)}`],
      ['Total Net Collection', formatINR(statement.totals.total_net)],
      ['Theater Rent', `- ${formatINR(statement.totals.total_theater_rent)}`],
      ['GST (18%)', `- ${formatINR(statement.totals.gst_amount)}`],
      ['Total Payable to Producer', formatINR(statement.totals.total_payable)],
    ];

    const sumX = doc.page.width / 2 - 60;
    summaryItems.forEach(([label, value], i) => {
      const isLast = i === summaryItems.length - 1;
      const y = doc.y;

      if (isLast) {
        doc.rect(sumX - 10, y - 2, 330, 18).fill('#1a1a2e');
        doc.fillColor('white');
      } else {
        doc.fillColor(i % 2 === 0 ? '#f8f9fa' : 'white');
        doc.rect(sumX - 10, y - 2, 330, 16).fill();
        doc.fillColor('#333');
      }

      doc.fontSize(isLast ? 10 : 9)
        .font(isLast ? 'Helvetica-Bold' : 'Helvetica')
        .text(label, sumX, doc.y, { width: 200 });

      // Value on same line (right-aligned)
      doc.font(isLast ? 'Helvetica-Bold' : 'Helvetica')
        .text(value, sumX + 200, y, { width: 120, align: 'right' });

      doc.fillColor('black');
      doc.moveDown(0.15);
    });

    doc.moveDown(1.5);

    // ── Signature Area ───────────────────────────────────────────────────────
    doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
    doc.moveDown(0.5);

    const sigY = doc.y;
    doc.fontSize(9).font('Helvetica')
      .text('Exhibitor Signature', 80, sigY + 40)
      .text('________________________', 60, sigY + 38)
      .text('Distributor / Admin Signature', doc.page.width - 220, sigY + 40)
      .text('________________________', doc.page.width - 240, sigY + 38);

    doc.moveDown(4);
    doc.fontSize(7).fillColor('#888')
      .text(`This document is system-generated by the WE Movie Distribution Platform. Generated on ${new Date().toLocaleString('en-IN')}.`, { align: 'center' });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get a single statement
// @route   GET /api/statements/:id
// @access  Private
const getStatementById = async (req, res) => {
  try {
    const statement = await PictureClosingStatement.findById(req.params.id).populate('generated_by', 'name');
    if (!statement) return res.status(404).json({ message: 'Statement not found' });
    res.json(statement);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { generateStatement, listStatements, downloadStatementPDF, getStatementById };
