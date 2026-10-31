const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createOrderSchema = z.object({
  courseId: z
    .string({ required_error: 'Course ID is required' })
    .trim()
    .regex(objectIdRegex, 'Invalid course ID format'),
});

const verifyPaymentSchema = z.object({
  razorpay_order_id: z
    .string({ required_error: 'Razorpay order ID is required' })
    .trim()
    .min(1, 'Razorpay order ID cannot be empty'),
  razorpay_payment_id: z
    .string({ required_error: 'Razorpay payment ID is required' })
    .trim()
    .min(1, 'Razorpay payment ID cannot be empty'),
  razorpay_signature: z
    .string({ required_error: 'Razorpay signature is required' })
    .trim()
    .min(1, 'Razorpay signature cannot be empty'),
});

const manualEnrollSchema = z.object({
  userId: z
    .string({ required_error: 'User ID is required' })
    .trim()
    .regex(objectIdRegex, 'Invalid user ID format'),
  courseId: z
    .string({ required_error: 'Course ID is required' })
    .trim()
    .regex(objectIdRegex, 'Invalid course ID format'),
  notes: z.string().trim().optional(),
});

module.exports = {
  createOrderSchema,
  verifyPaymentSchema,
  manualEnrollSchema,
};
