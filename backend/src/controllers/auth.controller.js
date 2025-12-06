const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const { UnauthorizedError, ValidationError } = require('../utils/errors');

class AuthController {
  /**
   * User login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      // Find user
      const user = await db.oneOrNone(
        'SELECT * FROM users WHERE email = $1 AND is_active = true',
        [email]
      );

      if (!user) {
        throw new UnauthorizedError('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        throw new UnauthorizedError('Invalid credentials');
      }

      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
      );

      // Save refresh token in database
      await db.none(
        `INSERT INTO sessions (user_id, refresh_token, user_agent, ip_address, expires_at)
         VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')`,
        [user.id, refreshToken, req.headers['user-agent'] || 'Unknown', req.ip]
      );

      // Update last login
      await db.none(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      );

      // Return user data without password
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar_url
      };

      return successResponse(res, {
        user: userData,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 3600
        }
      }, 'Login successful');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new ValidationError('Refresh token is required');
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

      // Check if session exists
      const session = await db.oneOrNone(
        `SELECT * FROM sessions
         WHERE user_id = $1 AND refresh_token = $2 AND expires_at > NOW()`,
        [decoded.userId, refreshToken]
      );

      if (!session) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Get user
      const user = await db.one(
        'SELECT id, role FROM users WHERE id = $1 AND is_active = true',
        [decoded.userId]
      );

      // Generate new access token
      const accessToken = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );

      return successResponse(res, {
        accessToken,
        expiresIn: 3600
      }, 'Token refreshed successfully');

    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return next(new UnauthorizedError('Invalid or expired refresh token'));
      }
      next(error);
    }
  }

  /**
   * User logout
   */
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        // Delete specific session
        await db.none(
          'DELETE FROM sessions WHERE user_id = $1 AND refresh_token = $2',
          [req.user.userId, refreshToken]
        );
      } else {
        // Delete all sessions for user
        await db.none(
          'DELETE FROM sessions WHERE user_id = $1',
          [req.user.userId]
        );
      }

      return successResponse(res, null, 'Logout successful');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(req, res, next) {
    try {
      const user = await db.one(
        `SELECT id, email, name, role, avatar_url, phone, created_at
         FROM users
         WHERE id = $1 AND is_active = true`,
        [req.user.userId]
      );

      return successResponse(res, user);

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
