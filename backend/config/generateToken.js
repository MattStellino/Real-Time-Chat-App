// backend/config/generateToken.js
const jwt = require('jsonwebtoken');

module.exports = function generateToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return jwt.sign({ _id: userId }, secret, { expiresIn: '30d' });
};
