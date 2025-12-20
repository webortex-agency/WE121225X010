const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

// Load models
const User = require('./models/User');
const Movie = require('./models/Movie');
const Exhibitor = require('./models/Exhibitor');

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Movie.deleteMany();
    await Exhibitor.deleteMany();

    console.log('Data Destroyed!');

    // Create a sample movie for manager/producer
    const movie = await Movie.create({
      movie_id: 'MOV-2025-001',
      movie_name: 'Game Changer',
      release_date: new Date('2025-01-10'),
      budget: 10000000,
      year: 2025,
      sequence: 1,
    });

    console.log('Sample movie created.');

    // Create a sample exhibitor
    const exhibitor = await Exhibitor.create({
        theater_name: 'Gowri Theater',
        address: '123 Main St, Anytown',
        contact_person: 'John Doe',
        phone: '555-1234',
        email: 'contact@gowritheater.com',
        gst_number: 'GSTIN123456789',
        login_credentials: {
            email: 'exhibitor@moviedist.com',
            password_hash: 'Exhibitor@123' // Will be hashed by pre-save hook
        }
    });

    console.log('Sample exhibitor created.');

    const salt = await bcrypt.genSalt(10);

    const users = [
      {
        name: 'Admin User',
        email: 'admin@moviedist.com',
        password_hash: await bcrypt.hash('Admin@123', salt),
        role: 'admin',
        status: 'active',
      },
      {
        name: 'Manager User',
        email: 'manager@moviedist.com',
        password_hash: await bcrypt.hash('Manager@123', salt),
        role: 'manager',
        assigned_movie_id: movie.movie_id,
        status: 'active',
      },
      {
        name: 'Producer User',
        email: 'producer@moviedist.com',
        password_hash: await bcrypt.hash('Producer@123', salt),
        role: 'producer',
        assigned_movie_id: movie.movie_id,
        status: 'active',
      },
      {
        name: 'Exhibitor User',
        email: 'exhibitor@moviedist.com',
        password_hash: await bcrypt.hash('Exhibitor@123', salt),
        role: 'exhibitor',
        exhibitor_id: exhibitor._id,
        status: 'active',
      },
    ];

    await User.insertMany(users);

    console.log('Data Imported!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Movie.deleteMany();
    await Exhibitor.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
