const jwt = require('jsonwebtoken');
const { JWT_ACCESS_SECRET } = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Middleware: Verify JWT access token in Authorization: Bearer <token>
 * Attaches authenticated user to req.user and rejects blocked accounts.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Unauthorized: Access token is required');
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_ACCESS_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Unauthorized: Access token has expired');
    }
    throw new ApiError(401, 'Unauthorized: Invalid access token');
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(401, 'Unauthorized: User account no longer exists');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Forbidden: Your account has been deactivated. Please contact support.');
  }

  req.user = user;
  next();
});

module.exports = authenticate;
