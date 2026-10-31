const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { validateQuery } = require('../middleware/validate');
const { courseQuerySchema } = require('../validators/course.validator');
const courseController = require('../controllers/course.controller');

// Public course catalog with query filtering
router.get('/', validateQuery(courseQuerySchema), courseController.getCourses);

// Public course detail by slug (lesson video URLs hidden except previews)
router.get('/:slug', courseController.getCourseBySlug);

// Full course content for enrolled students and admins
router.get('/:id/content', authenticate, courseController.getCourseContent);

module.exports = router;
