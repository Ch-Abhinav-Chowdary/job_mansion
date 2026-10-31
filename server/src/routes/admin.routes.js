const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Protect all admin routes with authentication and admin role authorization
router.use(authenticate, authorize('admin'));

// GET /api/admin/stats
router.get('/stats', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Admin stats endpoint reached successfully',
      adminUser: req.user.email,
    },
    message: 'Admin access granted',
  });
});

module.exports = router;
