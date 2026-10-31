const jwt = require('jsonwebtoken');
const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = require('../config/env');

/**
 * Generate a short-lived access token (~15 min).
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

/**
 * Generate a longer-lived refresh token (~7 days).
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

module.exports = { generateAccessToken, generateRefreshToken };
