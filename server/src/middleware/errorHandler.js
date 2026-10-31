const { NODE_ENV } = require('../config/env');

/**
 * Central error handler — last middleware in the chain.
 * Hides stack traces in production.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  console.error(`[ERROR] ${req.method} ${req.originalUrl} — ${message}`);
  if (NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    data: null,
    message: NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : message,
  });
};

module.exports = errorHandler;
