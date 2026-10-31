const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = require('../config/env');

/**
 * Generate a short-lived access token (~15 min).
 */
const generateAccessToken = (user) => {
  const userId = user._id ? user._id.toString() : user.id || user;
  const role = user.role || 'user';
  return jwt.sign({ id: userId, role }, JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

/**
 * Generate a longer-lived refresh token (~7 days).
 */
const generateRefreshToken = (user) => {
  const userId = user._id ? user._id.toString() : user.id || user;
  return jwt.sign({ id: userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

/**
 * Hash a token (refresh token or reset token) with SHA-256 before saving to DB.
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate a cryptographically secure random token (e.g. for password resets).
 */
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  generateRandomToken,
};
