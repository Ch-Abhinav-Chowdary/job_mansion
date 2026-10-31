const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { handleSingleUpload } = require('../middleware/upload');
const { createCourseSchema, updateCourseSchema } = require('../validators/course.validator');
const { updateEnquirySchema } = require('../validators/enquiry.validator');
const adminController = require('../controllers/admin.controller');
const paymentController = require('../controllers/payment.controller');
const { manualEnrollSchema } = require('../validators/payment.validator');

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

// ─── Stats ───────────────────────────────────
router.get('/stats', adminController.getStats);

// ─── Courses ─────────────────────────────────
router.get('/courses', adminController.getCourses);
router.post('/courses', validate(createCourseSchema), adminController.createCourse);
router.put('/courses/:id', validate(updateCourseSchema), adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);

// ─── Media upload ─────────────────────────────
router.post('/upload', handleSingleUpload('image'), adminController.uploadThumbnail);

// ─── Payments & Enrollments ───────────────────
router.get('/payments', adminController.getPayments);
router.post('/payments/:id/refund', paymentController.refundPayment);
router.post('/enrollments', validate(manualEnrollSchema), paymentController.manualEnroll);

// ─── Users ───────────────────────────────────
router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.setUserStatus);

// ─── Enquiries ────────────────────────────────
router.get('/enquiries', adminController.getEnquiries);
router.patch('/enquiries/:id', validate(updateEnquirySchema), adminController.updateEnquiry);

module.exports = router;
