const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.user_id).select('-password_hash');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
    }
    next();
  };
};

const verifyMovieAccess = (req, res, next) => {
  const { movie_id } = req.params;
  const user = req.user;

  if ((user.role === 'manager' || user.role === 'producer')) {
    if (!movie_id) {
      return res.status(400).json({ message: 'Movie ID is required in the URL for this route.' });
    }
    if (user.assigned_movie_id !== movie_id) {
      return res.status(403).json({ message: 'Forbidden: You do not have access to this movie.' });
    }
  }
  next();
};

module.exports = { protect, admin, authorizeRole, verifyMovieAccess };
