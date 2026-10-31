const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const ApiError = require('../utils/apiError');

/**
 * Get user profile (no passwordHash / refreshTokenHash).
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId).select('-passwordHash -refreshTokenHash');
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

/**
 * Update profile fields (name, phone, avatar).
 */
const updateProfile = async (userId, updates) => {
  const allowed = {};
  if (updates.name !== undefined) allowed.name = updates.name;
  if (updates.phone !== undefined) allowed.phone = updates.phone;
  if (updates.avatar !== undefined) allowed.avatar = updates.avatar;

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: allowed },
    { new: true, runValidators: true }
  ).select('-passwordHash -refreshTokenHash');

  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

/**
 * Change password — verifies the current password first.
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) throw new ApiError(404, 'User not found');

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) throw new ApiError(400, 'Current password is incorrect');

  const hash = await bcrypt.hash(newPassword, 12);
  // Invalidate all refresh tokens on password change
  user.passwordHash = hash;
  user.refreshTokenHash = null;
  await user.save();
};

/**
 * Get enrollments for a user, populating course summary fields.
 */
const getEnrollments = async (userId) => {
  return Enrollment.find({ user: userId, status: 'active' })
    .populate('course', 'title slug thumbnailUrl category price discountPrice')
    .sort({ createdAt: -1 });
};

/**
 * Get payment history for a user.
 */
const getPayments = async (userId) => {
  return Payment.find({ user: userId })
    .populate('course', 'title slug')
    .sort({ createdAt: -1 });
};

module.exports = { getProfile, updateProfile, changePassword, getEnrollments, getPayments };
