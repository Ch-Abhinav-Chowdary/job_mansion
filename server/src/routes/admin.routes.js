const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { handleSingleUpload } = require('../middleware/upload');
const { createCourseSchema, updateCourseSchema } = require('../validators/course.validator');
const adminController = require('../controllers/admin.controller');

// Enforce authenticate and admin role authorization across the entire admin router
router.use(authenticate, authorize('admin'));

// Admin Dashboard stats
router.get('/stats', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Admin stats endpoint reached successfully',
      adminUser: req.user.email,
    },
    message: 'Admin access granted',
  });
});

// Admin Course CRUD
router.get('/courses', adminController.getCourses);
router.post('/courses', validate(createCourseSchema), adminController.createCourse);
router.put('/courses/:id', validate(updateCourseSchema), adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);

// Admin Media Upload (Multer memory storage -> Cloudinary)
router.post('/upload', handleSingleUpload('image'), adminController.uploadThumbnail);

module.exports = router;
