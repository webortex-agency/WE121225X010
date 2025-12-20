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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});