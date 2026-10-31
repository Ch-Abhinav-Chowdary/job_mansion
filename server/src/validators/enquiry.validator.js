const { z } = require('zod');

const createEnquirySchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  phone: z
    .string()
    .min(7, 'Phone is required')
    .max(20),
  course: z.string().optional(), // Optional MongoDB ObjectId string
  message: z.string().min(5, 'Message is required').max(2000),
  type: z.enum(['enquiry', 'demo']).default('enquiry'),
});

const updateEnquirySchema = z.object({
  status: z.enum(['new', 'contacted', 'closed']),
});

module.exports = { createEnquirySchema, updateEnquirySchema };
