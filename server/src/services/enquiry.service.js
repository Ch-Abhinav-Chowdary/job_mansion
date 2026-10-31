const Enquiry = require('../models/Enquiry');
const emailService = require('./email.service');
const { ADMIN_EMAIL } = require('../config/env');

/**
 * Create a new enquiry and notify admin via email.
 */
const createEnquiry = async (data) => {
  const enquiry = await Enquiry.create(data);

  // Notify admin — log to console if email not configured
  const subject = `New ${enquiry.type} from ${enquiry.name} — Job Mansion`;
  const body = `
    Name: ${enquiry.name}
    Email: ${enquiry.email}
    Phone: ${enquiry.phone}
    Type: ${enquiry.type}
    Message: ${enquiry.message}
  `;
  await emailService.sendAdminNotification(ADMIN_EMAIL, subject, body);

  return enquiry;
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

  return {
    enquiries,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

/**
 * Update enquiry status (new -> contacted -> closed).
 */
const updateEnquiryStatus = async (id, status) => {
  const enquiry = await Enquiry.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true }
  );
  if (!enquiry) throw new (require('../utils/apiError'))(404, 'Enquiry not found');
  return enquiry;
};

module.exports = { createEnquiry, listEnquiries, updateEnquiryStatus };
