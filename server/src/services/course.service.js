const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const ApiError = require('../utils/apiError');

/**
 * List published courses with optional category, text search, and pagination.
 */
const listPublishedCourses = async ({ category, search, page = 1, limit = 10 }) => {
  const query = { isPublished: true };

  if (category) {
    query.category = { $regex: new RegExp(`^${category}$`, 'i') };
  }

  if (search) {
    query.$text = { $search: search };
  }

  const sortOptions = search
    ? { score: { $meta: 'textScore' } }
    : { createdAt: -1 };

  const total = await Course.countDocuments(query);
  const totalPages = Math.ceil(total / limit) || 1;

  // In listing view, exclude lesson video URLs for security and payload size
  const courses = await Course.find(query)
    .select('-lessons.videoUrl')
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    courses,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

/**
 * Get public course details by slug with syllabus.
 * Only lessons with isPreview: true have their videoUrl exposed.
 */
const getCourseBySlug = async (slug, user) => {
  const course = await Course.findOne({ slug });

  if (!course) {
    throw new ApiError(404, 'Course not found');
  }

  // Drafts stay hidden unless requested by an admin
  if (!course.isPublished && user?.role !== 'admin') {
    throw new ApiError(404, 'Course not found');
  }

  const courseObj = course.toObject();

  // Strip lesson video URLs except for preview lessons
  courseObj.lessons = (courseObj.lessons || []).map((lesson) => {
    if (!lesson.isPreview) {
      const { videoUrl, ...safeLesson } = lesson;
      return safeLesson;
    }
    return lesson;
  });

  return courseObj;
};

/**
 * Get full course content (all lesson videos) for enrolled students or admins.
 */
const getCourseContent = async (courseId, user) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new ApiError(404, 'Course not found');
  }

  // Admins bypass enrollment check; students must have an active enrollment
  if (user.role !== 'admin') {
    const enrollment = await Enrollment.findOne({
      user: user._id,
      course: course._id,
      status: 'active',
    });

    if (!enrollment) {
      throw new ApiError(403, 'Forbidden: You must be enrolled in this course to access its full content');
    }
  }

  return {
    courseId: course._id,
    title: course.title,
    lessons: course.lessons,
  };
};

/**
 * Admin: List all courses (published & drafts).
 */
const listAllCoursesAdmin = async ({ page = 1, limit = 20 }) => {
  const total = await Course.countDocuments();
  const totalPages = Math.ceil(total / limit) || 1;

  const courses = await Course.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    courses,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

/**
 * Admin: Create a new course.
 */
const createCourse = async (data) => {
  const course = new Course(data);
  await course.save();
  return course;
};

/**
 * Admin: Update an existing course.
 */
const updateCourse = async (courseId, data) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new ApiError(404, 'Course not found');
  }

  Object.assign(course, data);
  await course.save();
  return course;
};

/**
 * Admin: Soft delete a course by setting isPublished to false.
 */
const deleteCourse = async (courseId) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new ApiError(404, 'Course not found');
  }

  course.isPublished = false;
  await course.save();
  return course;
};

module.exports = {
  listPublishedCourses,
  getCourseBySlug,
  getCourseContent,
  listAllCoursesAdmin,
  createCourse,
  updateCourse,
  deleteCourse,
};
