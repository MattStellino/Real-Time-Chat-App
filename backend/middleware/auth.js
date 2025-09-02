// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');
const asyncHandler = require('express-async-handler');

const authenticateUser = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized - No token provided' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'mysupersecretkey123456789abcdefghijklmnopqrstuvwxyz';
    const decoded = jwt.verify(token, secret);

    // Accept multiple payload shapes
    const userId = decoded._id || decoded.id || decoded.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized - Invalid token payload' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Unauthorized - Invalid token format' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Unauthorized - Token expired' });
    } else {
      return res.status(401).json({ message: 'Unauthorized - Token verification failed' });
    }
  }
});

module.exports = authenticateUser;
