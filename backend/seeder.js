const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const User = require('./models/User');
const Movie = require('./models/Movie');
const Exhibitor = require('./models/Exhibitor');
const DailyCollection = require('./models/DailyCollection');

dotenv.config();
connectDB();

const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Movie.deleteMany();
    await Exhibitor.deleteMany();
    await DailyCollection.deleteMany();
    console.log('Existing data cleared.');

    // ── Movies ──────────────────────────────────────────────────────────────
    const movie1 = await Movie.create({
      movie_id: 'MOV-2025-001',
      title: 'Game Changer',
      release_date: new Date('2025-01-10'),
      genre: 'Action',
      description: 'A high-octane action thriller that changes the rules of the game.',
      budget: 10000000,
      language: 'Telugu',
      status: 'active',
    });

    const movie2 = await Movie.create({
      movie_id: 'MOV-2025-002',
      title: 'Kalki 2898',
      release_date: new Date('2025-03-15'),
      genre: 'Sci-Fi',
      description: 'A futuristic sci-fi epic set in the year 2898.',
      budget: 15000000,
      language: 'Hindi',
      status: 'active',
    });
    console.log('Movies created.');

    // ── Exhibitors ───────────────────────────────────────────────────────────
    const exhibitor1 = await Exhibitor.create({
      exhibitor_id: 'EXH-001',
      name: 'Gowri Theater',
      theater_location: '123 Main St, Hyderabad',
      contact: '9876543210',
      email: 'contact@gowritheater.com',
      gst_number: 'GSTIN123456789',
      login_credentials: {
        email: 'exhibitor@moviedist.com',
        password_hash: 'Exhibitor@123',
      },
    });

    const exhibitor2 = await Exhibitor.create({
      exhibitor_id: 'EXH-002',
      name: 'Prasad Multiplex',
      theater_location: '456 Film Nagar, Hyderabad',
      contact: '9876543211',
      email: 'contact@prasadmultiplex.com',
      gst_number: 'GSTIN987654321',
      login_credentials: {
        email: 'exhibitor2@moviedist.com',
        password_hash: 'Exhibitor2@123',
      },
    });

    const exhibitor3 = await Exhibitor.create({
      exhibitor_id: 'EXH-003',
      name: 'Minerva Cinema',
      theater_location: '789 Old City, Hyderabad',
      contact: '9876543212',
      email: 'contact@minervacinema.com',
      gst_number: 'GSTIN111222333',
      login_credentials: {
        email: 'exhibitor3@moviedist.com',
        password_hash: 'Exhibitor3@123',
      },
    });
    console.log('Exhibitors created.');

    // ── Users ────────────────────────────────────────────────────────────────
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
        assigned_movie_id: movie1.movie_id,
        status: 'active',
      },
      {
        name: 'Manager 2',
        email: 'manager2@moviedist.com',
        password_hash: await bcrypt.hash('Manager2@123', salt),
        role: 'manager',
        assigned_movie_id: movie2.movie_id,
        status: 'active',
      },
      {
        name: 'Producer User',
        email: 'producer@moviedist.com',
        password_hash: await bcrypt.hash('Producer@123', salt),
        role: 'producer',
        assigned_movie_id: movie1.movie_id,
        status: 'active',
      },
      {
        name: 'Exhibitor User',
        email: 'exhibitor@moviedist.com',
        password_hash: await bcrypt.hash('Exhibitor@123', salt),
        role: 'exhibitor',
        exhibitor_id: exhibitor1._id,
        status: 'active',
      },
      {
        name: 'Exhibitor 2',
        email: 'exhibitor2@moviedist.com',
        password_hash: await bcrypt.hash('Exhibitor2@123', salt),
        role: 'exhibitor',
        exhibitor_id: exhibitor2._id,
        status: 'active',
      },
      {
        name: 'Exhibitor 3',
        email: 'exhibitor3@moviedist.com',
        password_hash: await bcrypt.hash('Exhibitor3@123', salt),
        role: 'exhibitor',
        exhibitor_id: exhibitor3._id,
        status: 'active',
      },
    ];

    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers.find(u => u.role === 'admin');
    console.log('Users created.');

    // ── Sample DailyCollections ───────────────────────────────────────────────
    const today = new Date();
    const sampleCollections = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      sampleCollections.push({
        movie_id: movie1.movie_id,
        exhibitor_id: exhibitor1._id,
        theater_name: exhibitor1.name,
        gst_number: 'GSTIN123456789',
        date,
        day_name: date.toLocaleDateString('en-IN', { weekday: 'long' }),
        shows: {
          matinee: { collection: 18000, occupancy: 75, ticket_rate: 150, ac_charge: 200, count: 120 },
          afternoon: { collection: 22000, occupancy: 80, ticket_rate: 180, ac_charge: 220, count: 130 },
          first_show: { collection: 28000, occupancy: 85, ticket_rate: 200, ac_charge: 260, count: 140 },
          second_show: { collection: 32000, occupancy: 90, ticket_rate: 220, ac_charge: 280, count: 145 },
        },
        totals: { collection: 100000, occupancy_avg: 82, total_shows: 4 },
        net_collection: 99120,
        status: i > 2 ? 'approved' : 'submitted',
        submitted_by: createdUsers.find(u => u.role === 'exhibitor')._id,
      });
    }

    // Second exhibitor collections for movie2
    for (let i = 4; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      sampleCollections.push({
        movie_id: movie2.movie_id,
        exhibitor_id: exhibitor2._id,
        theater_name: exhibitor2.name,
        gst_number: 'GSTIN987654321',
        date,
        day_name: date.toLocaleDateString('en-IN', { weekday: 'long' }),
        shows: {
          matinee: { collection: 20000, occupancy: 70, ticket_rate: 160, ac_charge: 210, count: 125 },
          afternoon: { collection: 25000, occupancy: 78, ticket_rate: 190, ac_charge: 230, count: 132 },
          first_show: { collection: 31000, occupancy: 88, ticket_rate: 210, ac_charge: 270, count: 148 },
          second_show: { collection: 35000, occupancy: 92, ticket_rate: 230, ac_charge: 290, count: 152 },
        },
        totals: { collection: 111000, occupancy_avg: 82, total_shows: 4 },
        net_collection: 110000,
        status: i > 1 ? 'approved' : 'submitted',
        submitted_by: createdUsers.find(u => u.email === 'exhibitor2@moviedist.com')._id,
      });
    }

    await DailyCollection.insertMany(sampleCollections);
    console.log('Sample collections created.');

    console.log('\n✅ Data Imported Successfully!\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('  CREDENTIALS REFERENCE');
    console.log('═══════════════════════════════════════════════════');
    console.log('  Admin:       admin@moviedist.com      / Admin@123');
    console.log('  Manager 1:   manager@moviedist.com    / Manager@123    [MOV-2025-001]');
    console.log('  Manager 2:   manager2@moviedist.com   / Manager2@123   [MOV-2025-002]');
    console.log('  Producer:    producer@moviedist.com   / Producer@123   [MOV-2025-001]');
    console.log('  Exhibitor 1: exhibitor@moviedist.com  / Exhibitor@123');
    console.log('  Exhibitor 2: exhibitor2@moviedist.com / Exhibitor2@123');
    console.log('  Exhibitor 3: exhibitor3@moviedist.com / Exhibitor3@123');
    console.log('═══════════════════════════════════════════════════\n');

    process.exit();
  } catch (err) {
    console.error('Seeder error:', err);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Movie.deleteMany();
    await Exhibitor.deleteMany();
    await DailyCollection.deleteMany();
    console.log('All data destroyed.');
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
