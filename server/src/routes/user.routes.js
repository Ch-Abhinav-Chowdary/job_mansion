const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { updateProfileSchema, changePasswordSchema } = require('../validators/user.validator');
const userController = require('../controllers/user.controller');

// All user routes require authentication
router.use(authenticate);

router.get('/me', userController.getMe);
router.put('/me', validate(updateProfileSchema), userController.updateMe);
router.put('/me/password', validate(changePasswordSchema), userController.changePassword);
router.get('/me/enrollments', userController.getMyEnrollments);
router.get('/me/payments', userController.getMyPayments);

module.exports = router;
