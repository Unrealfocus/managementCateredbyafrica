/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
exports.successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code
 * @param {Object} details - Additional error details
 */
exports.errorResponse = (res, message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) => {
  const response = {
    success: false,
    error: {
      code,
      message
    },
    timestamp: new Date().toISOString()
  };

  if (details) {
    response.error.details = details;
  }

  return res.status(statusCode).json(response);
};
