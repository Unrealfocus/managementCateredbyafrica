const { APIError } = require('../utils/errors');

/**
 * Error handling middleware
 * Catches and formats all errors
 */
const errorMiddleware = (err, req, res, next) => {
  // Log error
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  // API errors (thrown by us)
  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details })
      },
      timestamp: new Date().toISOString()
    });
  }

  // Validation errors from express-validator
  if (err.name === 'ValidationError' || err.array) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message || 'Validation failed',
        details: err.array ? err.array() : err.errors
      },
      timestamp: new Date().toISOString()
    });
  }

  // PostgreSQL errors
  if (err.code) {
    // Unique violation
    if (err.code === '23505') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Resource already exists'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Foreign key violation
    if (err.code === '23503') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid reference to related resource'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Not null violation
    if (err.code === '23502') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Required field missing'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token'
      },
      timestamp: new Date().toISOString()
    });
  }

  // Multer errors (file upload)
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: err.message
      },
      timestamp: new Date().toISOString()
    });
  }

  // Default error
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    },
    timestamp: new Date().toISOString()
  });
};

module.exports = errorMiddleware;
