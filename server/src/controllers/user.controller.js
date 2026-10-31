const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/user.service');

/** GET /api/users/me */
const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user._id);
  res.json({ success: true, data: { user }, message: 'Profile fetched' });
});

/** PUT /api/users/me */
const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  res.json({ success: true, data: { user }, message: 'Profile updated' });
});

/** PUT /api/users/me/password */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await userService.changePassword(req.user._id, currentPassword, newPassword);
  res.json({ success: true, data: null, message: 'Password changed successfully' });
});

/** GET /api/users/me/enrollments */
const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await userService.getEnrollments(req.user._id);
  res.json({ success: true, data: { enrollments }, message: 'Enrollments fetched' });
});

/** GET /api/users/me/payments */
const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await userService.getPayments(req.user._id);
  res.json({ success: true, data: { payments }, message: 'Payment history fetched' });
});

module.exports = { getMe, updateMe, changePassword, getMyEnrollments, getMyPayments };
