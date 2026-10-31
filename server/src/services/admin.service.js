const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const Enquiry = require('../models/Enquiry');
const ApiError = require('../utils/apiError');

/**
 * Dashboard summary stats.
 */
const getStats = async () => {
  const [
    totalStudents,
    totalRevenue,
    activeEnrollments,
    newEnquiries,
    totalCourses,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Enrollment.countDocuments({ status: 'active' }),
    Enquiry.countDocuments({ status: 'new' }),
    Course.countDocuments({ isPublished: true }),
  ]);

  return {
    totalStudents,
    totalRevenuePaise: totalRevenue[0]?.total || 0,
    activeEnrollments,
    newEnquiries,
    totalCourses,
  };
};

/**
 * List users with optional search and pagination.
 */
const listUsers = async ({ search, page = 1, limit = 20 }) => {
  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-passwordHash -refreshTokenHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

/**
 * Block or unblock a user. Admin cannot block themselves.
 */
const setUserStatus = async (adminId, targetId, isActive) => {
  if (adminId.toString() === targetId) {
    throw new ApiError(400, 'You cannot change your own account status');
  }
  const user = await User.findByIdAndUpdate(
    targetId,
    { $set: { isActive } },
    { new: true }
  ).select('-passwordHash -refreshTokenHash');
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

/**
 * List payments with optional status + date filters and pagination.
 */
const listPayments = async ({ status, from, to, page = 1, limit = 20 }) => {
  const filter = {};
  if (status) filter.status = status;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const skip = (page - 1) * limit;
  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate('user', 'name email')
      .populate('course', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments(filter),
  ]);

  return { payments, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

/**
 * List enquiries with optional status filter and pagination.
 */
const listEnquiries = async ({ status, page = 1, limit = 20 }) => {
  const filter = {};
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [enquiries, total] = await Promise.all([
    Enquiry.find(filter)
      .populate('course', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Enquiry.countDocuments(filter),
  ]);

  return { enquiries, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

/**
 * Update enquiry status.
 */
const updateEnquiryStatus = async (id, status) => {
  const enquiry = await Enquiry.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true }
  );
  if (!enquiry) throw new ApiError(404, 'Enquiry not found');
  return enquiry;
};

module.exports = {
  getStats,
  listUsers,
  setUserStatus,
  listPayments,
  listEnquiries,
  updateEnquiryStatus,
};
