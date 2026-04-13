require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: 'https://we-121225-x010-b.vercel.app', // frontend URL
    credentials: true
  })
);

// Health check route
app.get('/', (req, res) => {
  res.send('Backend server is running 🚀');
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/exhibitors', require('./routes/exhibitorRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/collections', require('./routes/collectionRoutes'));
app.use('/api/ledger', require('./routes/ledgerRoutes'));
app.use('/api/statements', require('./routes/closingStatementRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});