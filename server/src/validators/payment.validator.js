const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createOrderSchema = z.object({
  courseId: z
    .string({ required_error: 'Course ID is required' })
    .trim()
    .regex(objectIdRegex, 'Invalid course ID format'),
});

const verifyPaymentSchema = z
  .object({
    razorpay_order_id: z.string().trim().optional(),
    razorpayOrderId: z.string().trim().optional(),
    razorpay_payment_id: z.string().trim().optional(),
    razorpayPaymentId: z.string().trim().optional(),
    razorpay_signature: z.string().trim().optional(),
    razorpaySignature: z.string().trim().optional(),
  })
  .refine(
    (data) => (data.razorpay_order_id || data.razorpayOrderId) && (data.razorpay_payment_id || data.razorpayPaymentId) && (data.razorpay_signature || data.razorpaySignature),
    { message: 'razorpay order ID, payment ID, and signature are required' }
  );

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
