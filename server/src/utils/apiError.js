/**
 * Custom API error with a status code.
 * Throw this in services/controllers and the central error handler catches it.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ApiError;
