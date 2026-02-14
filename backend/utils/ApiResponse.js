/**
 * Standardized API Response Class
 */

class ApiResponse {
  /**
   * Success Response
   */
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Created Response (201)
   */
  static created(res, data = null, message = 'Created successfully') {
    return this.success(res, data, message, 201);
  }

  /**
   * No Content Response (204)
   */
  static noContent(res, message = 'No content') {
    return res.status(204).json({
      success: true,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Paginated Response
   */
  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        pages: Math.ceil(pagination.total / pagination.limit),
        hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
        hasPrev: pagination.page > 1
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Error Response
   */
  static error(res, message = 'Error', statusCode = 500, errors = []) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Bad Request Response (400)
   */
  static badRequest(res, message = 'Bad Request', errors = []) {
    return this.error(res, message, 400, errors);
  }

  /**
   * Unauthorized Response (401)
   */
  static unauthorized(res, message = 'Unauthorized') {
    return this.error(res, message, 401);
  }

  /**
   * Forbidden Response (403)
   */
  static forbidden(res, message = 'Forbidden') {
    return this.error(res, message, 403);
  }

  /**
   * Not Found Response (404)
   */
  static notFound(res, message = 'Resource not found') {
    return this.error(res, message, 404);
  }

  /**
   * Conflict Response (409)
   */
  static conflict(res, message = 'Conflict') {
    return this.error(res, message, 409);
  }

  /**
   * Validation Error Response (422)
   */
  static validationError(res, errors = []) {
    return this.error(res, 'Validation Error', 422, errors);
  }

  /**
   * Too Many Requests Response (429)
   */
  static tooManyRequests(res, message = 'Too many requests') {
    return this.error(res, message, 429);
  }

  /**
   * Custom Response with custom status
   */
  static custom(res, statusCode, success, message, data = null, errors = []) {
    return res.status(statusCode).json({
      success,
      message,
      data,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Stream Response (for file downloads)
   */
  static stream(res, stream, filename, contentType = 'application/octet-stream') {
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    stream.pipe(res);
  }

  /**
   * Redirect Response
   */
  static redirect(res, url, statusCode = 302) {
    return res.redirect(statusCode, url);
  }

  /**
   * File Response
   */
  static file(res, filePath, filename, contentType) {
    res.setHeader('Content-Type', contentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    return res.sendFile(filePath);
  }
}

module.exports = ApiResponse;
