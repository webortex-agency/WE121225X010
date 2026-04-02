const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

// Load models
const User = require('./models/User');
const Movie = require('./models/Movie');
const Exhibitor = require('./models/Exhibitor');
const MovieExhibitorAssignment = require('./models/MovieExhibitorAssignment');

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
    await MovieExhibitorAssignment.deleteMany();

    console.log('Data Destroyed!');

    // Create a sample movie for manager/producer
    const movie = await Movie.create({
      movie_id: 'MOV-2025-001',
      title: 'Game Changer',
      release_date: new Date('2025-01-10'),
      genre: 'Action',
      description: 'An action-packed thriller featuring high-octane sequences and gripping storyline.',
      status: 'active',
    });

    console.log('Sample movie created.');

    // Create a sample exhibitor
    const exhibitor = await Exhibitor.create({
      exhibitor_id: 'EXH-001',
      name: 'Gowri Theater',
      theater_location: '123 Main St, Anytown, State - 123456',
      contact: '555-1234',
      email: 'contact@gowritheater.com',
      login_credentials: {
        email: 'exhibitor@moviedist.com',
        password_hash: 'Exhibitor@123' // Will be hashed by pre-save hook
      },
      status: 'active',
    });

    console.log('Sample exhibitor created.');

    // Create movie-exhibitor assignment
    const assignment = await MovieExhibitorAssignment.create({
      movie_id: movie._id,
      exhibitor_id: exhibitor._id,
      assigned_date: new Date(),
      status: 'active',
      agreement_accepted: false, // Exhibitor needs to accept the agreement
    });

    console.log('Movie-Exhibitor assignment created.');

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
    await MovieExhibitorAssignment.deleteMany();
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
