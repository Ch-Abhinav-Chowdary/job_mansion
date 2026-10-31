const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const {
  registerLimiter,
  loginLimiter,
  forgotPasswordLimiter,
} = require('../middleware/rateLimit');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validators/auth.validator');
const authController = require('../controllers/auth.controller');

// Public routes
router.post('/register', registerLimiter, validate(registerSchema), authController.register);
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', forgotPasswordLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Authenticated routes
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
