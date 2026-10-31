const { ZodError } = require('zod');

/**
 * Validate request body against a Zod schema.
 * Usage: router.post('/route', validate(mySchema), controller)
 */
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const issues = err.issues || err.errors || [];
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Validation failed',
        errors: issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    next(err);
  }
};

/**
 * Validate request query parameters against a Zod schema.
 * Usage: router.get('/route', validateQuery(myQuerySchema), controller)
 */
const validateQuery = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.query);
    // Assign parsed query values (with defaults/coercions)
    req.validatedQuery = parsed;
    try {
      req.query = parsed;
    } catch (e) {
      // In case req.query is read-only in certain express versions
      Object.assign(req.query, parsed);
    }
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const issues = err.issues || err.errors || [];
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Query validation failed',
        errors: issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    next(err);
  }
};

module.exports = validate;
module.exports.validate = validate;
module.exports.validateQuery = validateQuery;
