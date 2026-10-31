const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const cloudinary = require('../config/cloudinary');
const courseService = require('../services/course.service');

/**
 * GET /api/admin/courses
 * Admin: List all courses (published & drafts).
 */
const getCourses = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const result = await courseService.listAllCoursesAdmin({ page, limit });

  res.status(200).json({
    success: true,
    data: result,
    message: 'Admin courses fetched successfully',
  });
});

/**
 * POST /api/admin/courses
 * Admin: Create a new course.
 */
const createCourse = asyncHandler(async (req, res) => {
  const course = await courseService.createCourse(req.body);

  res.status(201).json({
    success: true,
    data: { course },
    message: 'Course created successfully',
  });
});

/**
 * PUT /api/admin/courses/:id
 * Admin: Update an existing course.
 */
const updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const course = await courseService.updateCourse(id, req.body);

  res.status(200).json({
    success: true,
    data: { course },
    message: 'Course updated successfully',
  });
});

/**
 * DELETE /api/admin/courses/:id
 * Admin: Soft delete a course by unpublishing it.
 */
const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const course = await courseService.deleteCourse(id);

  res.status(200).json({
    success: true,
    data: { course },
    message: 'Course unpublished successfully (soft delete)',
  });
});

/**
 * POST /api/admin/upload
 * Admin: Accepts one image via Multer (max 2MB, JPG/PNG/WebP) and uploads it to Cloudinary.
 */
const uploadThumbnail = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please select an image file to upload (image field)');
  }

  try {
    const base64String = req.file.buffer.toString('base64');
    const uploadURI = `data:${req.file.mimetype};base64,${base64String}`;

    const result = await cloudinary.uploader.upload(uploadURI, {
      folder: 'jobmansion/courses',
      resource_type: 'image',
    });

    res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        bytes: result.bytes,
        format: result.format,
      },
      message: 'Image uploaded successfully to Cloudinary',
    });
  } catch (err) {
    throw new ApiError(500, `Cloudinary upload failed: ${err.message}`);
  }
});

module.exports = {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  uploadThumbnail,
};
