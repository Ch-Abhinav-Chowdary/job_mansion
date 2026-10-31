const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const paymentService = require('../services/payment.service');

/**
 * POST /api/payments/create-order
 * Authenticated user: Creates Razorpay order for a published course.
 */
const createOrder = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const result = await paymentService.createOrder({
    courseId,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    data: result,
    message: 'Razorpay order created successfully',
  });
});

/**
 * POST /api/payments/verify
 * Authenticated user: Verifies payment HMAC signature and activates enrollment idempotently.
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const orderId = req.body.razorpay_order_id || req.body.razorpayOrderId;
  const paymentId = req.body.razorpay_payment_id || req.body.razorpayPaymentId;
  const signature = req.body.razorpay_signature || req.body.razorpaySignature;

  const result = await paymentService.verifyPayment({
    orderId,
    paymentId,
    signature,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    data: result,
    message: result.alreadyActivated
      ? 'Payment was already verified and enrollment is active'
      : 'Payment verified and enrollment activated successfully',
  });
});

/**
 * POST /api/payments/webhook
 * Razorpay server-to-server webhook endpoint using raw body signature verification.
 */
const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];

  if (!signature) {
    throw new ApiError(400, 'Missing X-Razorpay-Signature header');
  }

  // Get raw body as buffer
  let rawBodyBuffer = req.rawBody;
  if (!rawBodyBuffer && Buffer.isBuffer(req.body)) {
    rawBodyBuffer = req.body;
  } else if (!rawBodyBuffer && typeof req.body === 'string') {
    rawBodyBuffer = Buffer.from(req.body, 'utf8');
  } else if (!rawBodyBuffer && typeof req.body === 'object') {
    rawBodyBuffer = Buffer.from(JSON.stringify(req.body), 'utf8');
  }

  const isValid = paymentService.verifyWebhookSignature(rawBodyBuffer, signature);

  if (!isValid) {
    throw new ApiError(400, 'Invalid webhook signature');
  }

  // Signature is valid — acknowledge 200 immediately and process event
  let eventPayload;
  try {
    eventPayload = Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString('utf8')) : req.body;
  } catch (err) {
    eventPayload = JSON.parse(rawBodyBuffer.toString('utf8'));
  }

  // Process event asynchronously/idempotently
  await paymentService.handleWebhookEvent(eventPayload);

  res.status(200).json({
    success: true,
    message: 'Webhook processed successfully',
  });
});

/**
 * POST /api/admin/payments/:id/refund
 * Admin only: Refunds payment and revokes user enrollment.
 */
const refundPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await paymentService.refundPayment(id);

  res.status(200).json({
    success: true,
    data: result,
    message: 'Payment refunded and enrollment revoked successfully',
  });
});

/**
 * POST /api/admin/enrollments
 * Admin only: Manually enrolls a student for offline or cash payments.
 */
const manualEnroll = asyncHandler(async (req, res) => {
  const result = await paymentService.manualEnroll(req.body);

  res.status(201).json({
    success: true,
    data: result,
    message: 'Student manually enrolled successfully',
  });
});

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
  refundPayment,
  manualEnroll,
};
