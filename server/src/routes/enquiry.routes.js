const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const validate = require('../middleware/validate');
const { createEnquirySchema } = require('../validators/enquiry.validator');
const enquiryController = require('../controllers/enquiry.controller');

// Rate limit: 5 enquiries per IP per 15 minutes
const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, data: null, message: 'Too many enquiries. Please try again later.' },
});

// POST /api/enquiries — public
router.post('/', enquiryLimiter, validate(createEnquirySchema), enquiryController.createEnquiry);

module.exports = router;
