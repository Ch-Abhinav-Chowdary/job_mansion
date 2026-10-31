const asyncHandler = require('../utils/asyncHandler');
const enquiryService = require('../services/enquiry.service');

/** POST /api/enquiries */
const createEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await enquiryService.createEnquiry(req.body);
  res.status(201).json({
    success: true,
    data: { enquiry },
    message: 'Enquiry submitted. We will get back to you shortly.',
  });
});

module.exports = { createEnquiry };
