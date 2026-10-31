/**
 * Wraps an async route handler to catch errors and pass them to next().
 * Usage: router.get('/route', asyncHandler(myController))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
