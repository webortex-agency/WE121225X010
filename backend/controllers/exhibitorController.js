const Exhibitor = require('../models/Exhibitor');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Create a new exhibitor
// @route   POST /api/exhibitors
// @access  Private (Admin)
const createExhibitor = async (req, res) => {
  const { name, theater_location, contact, email } = req.body;

  // Validation
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Name is required' });
  }
  if (!theater_location || !theater_location.trim()) {
    return res.status(400).json({ message: 'Theater location is required' });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const exhibitorExists = await Exhibitor.findOne({ $or: [{ email }, { name }] });

    if (exhibitorExists) {
      return res.status(400).json({ message: 'Exhibitor with this email or name already exists' });
    }

    // Generate exhibitor_id
    const count = await Exhibitor.countDocuments();
    const exhibitor_id = `EXH-${(count + 1).toString().padStart(3, '0')}`;

    // Auto-generate login credentials
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const login_email = `exhibitor_${count + 1}@distrib.com`;

    const exhibitor = new Exhibitor({
      exhibitor_id,
      name,
      theater_location,
      contact,
      email,
      created_by: req.user.id,
      login_credentials: {
        email: login_email,
        password_hash: hashedPassword,
      },
    });

    const createdExhibitor = await exhibitor.save();

    // Create a corresponding user account for the exhibitor
    await User.create({
      name: name, // Use theater name as user name
      email: login_email,
      password_hash: hashedPassword,
      role: 'exhibitor',
      exhibitor_id: createdExhibitor._id,
      created_by: req.user.id,
    });

    // Return with temp credentials
    const response = {
      ...createdExhibitor.toObject(),
      temp_password: tempPassword,
      temp_email: login_email,
    };
    // Remove password_hash from response
    delete response.login_credentials.password_hash;

    res.status(201).json(response);
    return;
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all exhibitors
// @route   GET /api/exhibitors
// @access  Private (Admin)
const getExhibitors = async (req, res) => {
  try {
    const exhibitors = await Exhibitor.find({});
    res.json(exhibitors);
    return;
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update exhibitor details
// @route   PUT /api/exhibitors/:id
// @access  Private (Admin)
const updateExhibitor = async (req, res) => {
  const { name, theater_location, contact, email, status } = req.body;

  try {
    const exhibitor = await Exhibitor.findOne({ $or: [{ _id: req.params.id }, { exhibitor_id: req.params.id }] });

    if (exhibitor) {
      exhibitor.name = name || exhibitor.name;
      exhibitor.theater_location = theater_location || exhibitor.theater_location;
      exhibitor.contact = contact || exhibitor.contact;
      exhibitor.email = email || exhibitor.email;
      exhibitor.status = status || exhibitor.status;

      const updatedExhibitor = await exhibitor.save();
      res.json(updatedExhibitor);
      return;
    } else {
      res.status(404).json({ message: 'Exhibitor not found' });
      return;
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Soft delete exhibitor
// @route   DELETE /api/exhibitors/:id
// @access  Private (Admin)
const deleteExhibitor = async (req, res) => {
  try {
    const exhibitor = await Exhibitor.findOne({ $or: [{ _id: req.params.id }, { exhibitor_id: req.params.id }] });

    if (exhibitor) {
      exhibitor.status = 'inactive';
      await exhibitor.save();
      res.json({ message: 'Exhibitor deleted successfully' });
      return;
    } else {
      res.status(404).json({ message: 'Exhibitor not found' });
      return;
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { createExhibitor, getExhibitors, updateExhibitor, deleteExhibitor };
