const asyncHandler = require('../utils/asyncHandler');
const courseService = require('../services/course.service');

/**
 * GET /api/courses
 * Public: List published courses with search, category, and pagination filters.
 */
const getCourses = asyncHandler(async (req, res) => {
  const queryParams = req.validatedQuery || req.query;
  const result = await courseService.listPublishedCourses(queryParams);

  res.status(200).json({
    success: true,
    data: result,
    message: 'Courses fetched successfully',
  });
});

/**
 * GET /api/courses/:slug
 * Public: Get course details and syllabus (non-preview lesson videos are hidden).
 */
const getCourseBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const course = await courseService.getCourseBySlug(slug, req.user);

  res.status(200).json({
    success: true,
    data: { course },
    message: 'Course details fetched successfully',
  });
});

/**
 * GET /api/courses/:id/content
 * Authenticated: Returns full lessons with videos for enrolled users or admins.
 */
const getCourseContent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const content = await courseService.getCourseContent(id, req.user);

  res.status(200).json({
    success: true,
    data: content,
    message: 'Course content fetched successfully',
  });
});

module.exports = {
  getCourses,
  getCourseBySlug,
  getCourseContent,
};
