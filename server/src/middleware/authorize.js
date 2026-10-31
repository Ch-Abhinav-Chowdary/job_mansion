const ApiError = require('../utils/apiError');

/**
 * Middleware: Role authorization guard.
 * Usage: router.use(authenticate, authorize('admin'))
 *    or: router.get('/admin-only', authenticate, authorize('admin'), controller)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Unauthorized: Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden: Insufficient permissions to access this resource'));
    }

    next();
  };
};

module.exports = authorize;
