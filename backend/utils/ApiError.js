/**
 * Custom API Error Class
 */

class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, errors = []) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    this.errors = errors;
    this.timestamp = new Date().toISOString();
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Bad Request (400)
   */
  static badRequest(message = 'Bad Request', errors = []) {
    return new ApiError(400, message, true, errors);
  }

  /**
   * Unauthorized (401)
   */
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message, true);
  }

  /**
   * Forbidden (403)
   */
  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message, true);
  }

  /**
   * Not Found (404)
   */
  static notFound(message = 'Resource not found') {
    return new ApiError(404, message, true);
  }

  /**
   * Conflict (409)
   */
  static conflict(message = 'Conflict') {
    return new ApiError(409, message, true);
  }

  /**
   * Too Many Requests (429)
   */
  static tooManyRequests(message = 'Too many requests') {
    return new ApiError(429, message, true);
  }

  /**
   * Internal Server Error (500)
   */
  static internal(message = 'Internal Server Error') {
    return new ApiError(500, message, false);
  }

  /**
   * Service Unavailable (503)
   */
  static serviceUnavailable(message = 'Service Unavailable') {
    return new ApiError(503, message, true);
  }

  /**
   * Validation Error (422)
   */
  static validationError(errors = []) {
    return new ApiError(422, 'Validation Error', true, errors);
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      success: false,
      status: this.status,
      statusCode: this.statusCode,
      message: this.message,
      errors: this.errors,
      timestamp: this.timestamp,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
    };
  }
}

module.exports = ApiError;
