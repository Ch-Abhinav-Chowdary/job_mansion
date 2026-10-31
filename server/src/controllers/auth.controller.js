const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { NODE_ENV, CLIENT_URL, JWT_REFRESH_SECRET } = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  generateRandomToken,
} = require('../utils/generateToken');
const { sendPasswordResetEmail } = require('../services/email.service');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: NODE_ENV === 'production',
  sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * POST /api/auth/register
 * Public: Register a new student account (role is always 'user').
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(400, 'An account with this email address already exists');
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // Client cannot choose role — always hardcoded to 'user'
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    phone: phone || '',
    passwordHash,
    role: 'user',
    isActive: true,
  });

  res.status(201).json({
    success: true,
    data: { user },
    message: 'User registered successfully',
  });
});

/**
 * POST /api/auth/login
 * Public: Authenticate and receive 15-minute access token + 7-day refresh token cookie.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Block login for deactivated accounts
  if (!user.isActive) {
    throw new ApiError(403, 'Account has been deactivated. Please contact support.');
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store hashed refresh token in database for rotation
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

  res.status(200).json({
    success: true,
    data: {
      accessToken,
      user,
    },
    message: 'Login successful',
  });
});

/**
 * POST /api/auth/refresh
 * Rotates refresh token and issues a new access token.
 */
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!token) {
    return res.status(200).json({
      success: false,
      data: null,
      message: 'No active session',
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Unauthorized: Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, 'Unauthorized: User account no longer exists');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Forbidden: Account has been deactivated');
  }

  // Verify stored hash matches incoming token
  const incomingHash = hashToken(token);
  if (!user.refreshTokenHash || user.refreshTokenHash !== incomingHash) {
    // Invalidate stored token if reuse or tampered token detected
    user.refreshTokenHash = null;
    await user.save();
    throw new ApiError(401, 'Unauthorized: Invalid refresh token, please login again');
  }

  // Rotate tokens
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  user.refreshTokenHash = hashToken(newRefreshToken);
  await user.save();

  res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);

  res.status(200).json({
    success: true,
    data: {
      accessToken: newAccessToken,
      user,
    },
    message: 'Token refreshed successfully',
  });
});

/**
 * POST /api/auth/logout
 * Clears refresh token cookie and invalidates stored hash.
 */
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (req.user) {
    req.user.refreshTokenHash = null;
    await req.user.save();
  } else if (token) {
    const incomingHash = hashToken(token);
    await User.findOneAndUpdate({ refreshTokenHash: incomingHash }, { refreshTokenHash: null });
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
  });

  res.status(200).json({
    success: true,
    data: null,
    message: 'Logged out successfully',
  });
});

/**
 * POST /api/auth/forgot-password
 * Public: Creates a 30-minute single-use reset token and emails or logs reset link.
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });

  if (user && user.isActive) {
    const rawToken = generateRandomToken();
    user.passwordResetTokenHash = hashToken(rawToken);
    user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save();

    const resetUrl = `${CLIENT_URL}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);
  }

  // Always return identical success message to avoid email enumeration
  res.status(200).json({
    success: true,
    data: null,
    message: 'If that email address is registered, a password reset link has been sent.',
  });
});

/**
 * POST /api/auth/reset-password
 * Public: Resets password using single-use reset token and invalidates all refresh tokens.
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const hashedToken = hashToken(token);

  const user = await User.findOne({
    passwordResetTokenHash: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired password reset token');
  }

  const salt = await bcrypt.genSalt(12);
  user.passwordHash = await bcrypt.hash(password, salt);

  // Invalidate reset token and all refresh tokens
  user.passwordResetTokenHash = null;
  user.passwordResetExpires = null;
  user.refreshTokenHash = null;
  await user.save();

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
  });

  res.status(200).json({
    success: true,
    data: null,
    message: 'Password reset successful. Please log in with your new password.',
  });
});

/**
 * GET /api/auth/me
 * Authenticated: Returns current user profile.
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user },
    message: 'User profile fetched successfully',
  });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
};
