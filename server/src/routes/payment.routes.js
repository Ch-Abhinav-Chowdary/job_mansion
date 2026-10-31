const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { createOrderSchema, verifyPaymentSchema } = require('../validators/payment.validator');
const paymentController = require('../controllers/payment.controller');

// Webhook route: receives raw body for HMAC signature verification
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleWebhook
);

// Authenticated user payment routes
router.post('/create-order', authenticate, validate(createOrderSchema), paymentController.createOrder);
router.post('/verify', authenticate, validate(verifyPaymentSchema), paymentController.verifyPayment);

module.exports = router;
