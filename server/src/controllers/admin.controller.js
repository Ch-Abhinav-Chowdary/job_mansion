const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const cloudinary = require('../config/cloudinary');
const courseService = require('../services/course.service');
const adminService = require('../services/admin.service');

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────

/** GET /api/admin/stats */
const getStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getStats();
  res.json({ success: true, data: stats, message: 'Stats fetched' });
});

// ─────────────────────────────────────────────
// Courses
// ─────────────────────────────────────────────

/** GET /api/admin/courses */
const getCourses = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const result = await courseService.listAllCoursesAdmin({ page, limit });
  res.json({ success: true, data: result, message: 'Admin courses fetched' });
});

/** POST /api/admin/courses */
const createCourse = asyncHandler(async (req, res) => {
  const course = await courseService.createCourse(req.body);
  res.status(201).json({ success: true, data: { course }, message: 'Course created' });
});

/** PUT /api/admin/courses/:id */
const updateCourse = asyncHandler(async (req, res) => {
  const course = await courseService.updateCourse(req.params.id, req.body);
  res.json({ success: true, data: { course }, message: 'Course updated' });
});

/** DELETE /api/admin/courses/:id */
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await courseService.deleteCourse(req.params.id);
  res.json({ success: true, data: { course }, message: 'Course unpublished (soft delete)' });
});

/** POST /api/admin/upload */
const uploadThumbnail = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Please select an image file (field: image)');

  try {
    const uri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(uri, {
      folder: 'jobmansion/courses',
      resource_type: 'image',
    });
    res.json({
      success: true,
      data: { url: result.secure_url, publicId: result.public_id, bytes: result.bytes, format: result.format },
      message: 'Image uploaded to Cloudinary',
    });
  } catch (err) {
    throw new ApiError(500, `Cloudinary upload failed: ${err.message}`);
  }
});

// ─────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────

/** GET /api/admin/users */
const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const { search } = req.query;
  const result = await adminService.listUsers({ search, page, limit });
  res.json({ success: true, data: result, message: 'Users fetched' });
});

/** PATCH /api/admin/users/:id/status */
const setUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  if (typeof isActive !== 'boolean') {
    throw new ApiError(400, 'isActive must be a boolean');
  }
  const user = await adminService.setUserStatus(req.user._id, req.params.id, isActive);
  res.json({
    success: true,
    data: { user },
    message: `User ${isActive ? 'unblocked' : 'blocked'} successfully`,
  });
});

// ─────────────────────────────────────────────
// Payments
// ─────────────────────────────────────────────

/** GET /api/admin/payments */
const getPayments = asyncHandler(async (req, res) => {
  const { status, from, to } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const result = await adminService.listPayments({ status, from, to, page, limit });
  res.json({ success: true, data: result, message: 'Payments fetched' });
});

// ─────────────────────────────────────────────
// Enquiries
// ─────────────────────────────────────────────

/** GET /api/admin/enquiries */
const getEnquiries = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const result = await adminService.listEnquiries({ status, page, limit });
  res.json({ success: true, data: result, message: 'Enquiries fetched' });
});

/** PATCH /api/admin/enquiries/:id */
const updateEnquiry = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) throw new ApiError(400, 'status is required');
  const enquiry = await adminService.updateEnquiryStatus(req.params.id, status);
  res.json({ success: true, data: { enquiry }, message: 'Enquiry status updated' });
});

module.exports = {
  getStats,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  uploadThumbnail,
  getUsers,
  setUserStatus,
  getPayments,
  getEnquiries,
  updateEnquiry,
};
