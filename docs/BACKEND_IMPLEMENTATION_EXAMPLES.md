# Backend Implementation Examples
## Catered by Africa - Code Samples & Best Practices

This document provides practical code examples for implementing the backend API.

---

## Table of Contents
1. [Project Structure](#project-structure)
2. [Express.js Setup](#expressjs-setup)
3. [Database Connection](#database-connection)
4. [Authentication](#authentication)
5. [API Controllers](#api-controllers)
6. [Middleware](#middleware)
7. [Services](#services)
8. [Email Integration](#email-integration)
9. [SMS/WhatsApp Integration](#smswhatsapp-integration)
10. [Real-time Updates](#real-time-updates)

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── redis.js
│   │   └── env.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── customer.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── email.controller.js
│   │   ├── message.controller.js
│   │   └── automation.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── validation.middleware.js
│   │   ├── error.middleware.js
│   │   └── rateLimit.middleware.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── customer.model.js
│   │   ├── order.model.js
│   │   └── product.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── customer.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── email.routes.js
│   │   └── index.js
│   ├── services/
│   │   ├── email.service.js
│   │   ├── sms.service.js
│   │   ├── automation.service.js
│   │   └── analytics.service.js
│   ├── utils/
│   │   ├── response.js
│   │   ├── errors.js
│   │   └── validators.js
│   ├── app.js
│   └── server.js
├── tests/
├── .env.example
├── package.json
└── README.md
```

---

## Express.js Setup

### server.js
```javascript
require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./config/database');

const PORT = process.env.PORT || 3000;

// Test database connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected successfully');

    // Sync models (development only)
    if (process.env.NODE_ENV === 'development') {
      return sequelize.sync({ alter: true });
    }
  })
  .then(() => {
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch((error) => {
    console.error('❌ Unable to connect to database:', error);
    process.exit(1);
  });

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});
```

### app.js
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

// Error handling
app.use(errorMiddleware);

module.exports = app;
```

---

## Database Connection

### config/database.js (Sequelize)
```javascript
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

module.exports = { sequelize };
```

### config/database.js (pg-promise)
```javascript
const pgp = require('pg-promise')();

const db = pgp({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  max: 10
});

module.exports = db;
```

### config/redis.js
```javascript
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  db: 0,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

module.exports = redis;
```

---

## Authentication

### controllers/auth.controller.js
```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await db.oneOrNone(
        'SELECT * FROM users WHERE email = $1 AND is_active = true',
        [email]
      );

      if (!user) {
        return errorResponse(res, 'Invalid credentials', 401, 'UNAUTHORIZED');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        return errorResponse(res, 'Invalid credentials', 401, 'UNAUTHORIZED');
      }

      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
      );

      // Save refresh token in database
      await db.none(
        `INSERT INTO sessions (user_id, refresh_token, user_agent, ip_address, expires_at)
         VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')`,
        [user.id, refreshToken, req.headers['user-agent'], req.ip]
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

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return errorResponse(res, 'Refresh token required', 400, 'VALIDATION_ERROR');
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
        return errorResponse(res, 'Invalid refresh token', 401, 'UNAUTHORIZED');
      }

      // Get user
      const user = await db.one(
        'SELECT * FROM users WHERE id = $1 AND is_active = true',
        [decoded.userId]
      );

      // Generate new access token
      const accessToken = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return successResponse(res, {
        accessToken,
        expiresIn: 3600
      }, 'Token refreshed successfully');

    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return errorResponse(res, 'Invalid refresh token', 401, 'UNAUTHORIZED');
      }
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;

      // Delete session
      await db.none(
        'DELETE FROM sessions WHERE user_id = $1 AND refresh_token = $2',
        [req.user.userId, refreshToken]
      );

      return successResponse(res, null, 'Logout successful');

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
```

### middleware/auth.middleware.js
```javascript
const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'No token provided', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token', 401, 'UNAUTHORIZED');
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired', 401, 'TOKEN_EXPIRED');
    }
    return errorResponse(res, 'Authentication failed', 401, 'UNAUTHORIZED');
  }
};

// Role-based middleware
const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401, 'UNAUTHORIZED');
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'Insufficient permissions', 403, 'FORBIDDEN');
    }

    next();
  };
};

module.exports = { authMiddleware, roleMiddleware };
```

---

## API Controllers

### controllers/customer.controller.js
```javascript
const db = require('../config/database');
const redis = require('../config/redis');
const { successResponse, errorResponse } = require('../utils/response');

class CustomerController {
  async getAllCustomers(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        filter = 'all',
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = req.query;

      const offset = (page - 1) * limit;

      // Build where clause
      let whereClause = 'WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      // Search filter
      if (search) {
        whereClause += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      // Order filter
      if (filter === 'with_orders') {
        whereClause += ' AND total_orders > 0';
      } else if (filter === 'without_orders') {
        whereClause += ' AND total_orders = 0';
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) FROM customers ${whereClause}`;
      const { count } = await db.one(countQuery, params);

      // Get customers
      params.push(limit, offset);
      const query = `
        SELECT
          id, name, email, phone, avatar_url,
          total_orders, total_revenue, last_order_date,
          status, created_at
        FROM customers
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const customers = await db.any(query, params);

      // Get stats
      const stats = await db.one(`
        SELECT
          COUNT(*) as total_customers,
          COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE) as new_today,
          COUNT(*) FILTER (WHERE total_orders > 0) as with_orders,
          COUNT(*) FILTER (WHERE total_orders = 0) as without_orders
        FROM customers
      `);

      return successResponse(res, {
        customers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(count),
          totalPages: Math.ceil(count / limit)
        },
        stats: {
          totalCustomers: parseInt(stats.total_customers),
          newToday: parseInt(stats.new_today),
          withOrders: parseInt(stats.with_orders),
          withoutOrders: parseInt(stats.without_orders)
        }
      });

    } catch (error) {
      next(error);
    }
  }

  async getCustomerById(req, res, next) {
    try {
      const { customerId } = req.params;

      // Check cache first
      const cacheKey = `customer:${customerId}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        return successResponse(res, JSON.parse(cached));
      }

      // Get customer
      const customer = await db.oneOrNone(`
        SELECT
          id, name, email, phone, avatar_url,
          total_orders, total_revenue, last_order_date,
          status, tags, notes, address, city, country,
          created_at, updated_at
        FROM customers
        WHERE id = $1
      `, [customerId]);

      if (!customer) {
        return errorResponse(res, 'Customer not found', 404, 'NOT_FOUND');
      }

      // Get recent orders
      const orders = await db.any(`
        SELECT
          id, order_number, total_amount, status,
          created_at, delivered_at
        FROM orders
        WHERE customer_id = $1
        ORDER BY created_at DESC
        LIMIT 10
      `, [customerId]);

      const result = { ...customer, orders };

      // Cache for 5 minutes
      await redis.setex(cacheKey, 300, JSON.stringify(result));

      return successResponse(res, result);

    } catch (error) {
      next(error);
    }
  }

  async createCustomer(req, res, next) {
    try {
      const { name, email, phone } = req.body;

      // Check if email exists
      const existing = await db.oneOrNone(
        'SELECT id FROM customers WHERE email = $1',
        [email]
      );

      if (existing) {
        return errorResponse(res, 'Email already exists', 409, 'CONFLICT');
      }

      // Create customer
      const customer = await db.one(`
        INSERT INTO customers (name, email, phone)
        VALUES ($1, $2, $3)
        RETURNING id, name, email, phone, avatar_url, total_orders,
                  total_revenue, status, created_at
      `, [name, email, phone]);

      return successResponse(res, customer, 'Customer created successfully', 201);

    } catch (error) {
      next(error);
    }
  }

  async updateCustomer(req, res, next) {
    try {
      const { customerId } = req.params;
      const updates = req.body;

      // Build update query dynamically
      const fields = [];
      const values = [];
      let paramIndex = 1;

      Object.keys(updates).forEach(key => {
        if (['name', 'phone', 'notes', 'status', 'address', 'city'].includes(key)) {
          fields.push(`${key} = $${paramIndex}`);
          values.push(updates[key]);
          paramIndex++;
        }
      });

      if (fields.length === 0) {
        return errorResponse(res, 'No valid fields to update', 400, 'VALIDATION_ERROR');
      }

      values.push(customerId);

      const query = `
        UPDATE customers
        SET ${fields.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex}
        RETURNING id, name, email, phone, status, updated_at
      `;

      const customer = await db.one(query, values);

      // Invalidate cache
      await redis.del(`customer:${customerId}`);

      return successResponse(res, customer, 'Customer updated successfully');

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CustomerController();
```

### controllers/dashboard.controller.js
```javascript
const db = require('../config/database');
const redis = require('../config/redis');
const { successResponse } = require('../utils/response');

class DashboardController {
  async getMetrics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      // Cache key
      const cacheKey = `dashboard:metrics:${startDate || 'all'}:${endDate || 'all'}`;

      // Check cache
      const cached = await redis.get(cacheKey);
      if (cached) {
        return successResponse(res, JSON.parse(cached));
      }

      // Build date filter
      let dateFilter = '';
      const params = [];
      if (startDate && endDate) {
        dateFilter = 'WHERE created_at BETWEEN $1 AND $2';
        params.push(startDate, endDate);
      }

      // Get metrics
      const metrics = await db.one(`
        SELECT
          COALESCE(SUM(total_amount), 0) as total_sales,
          COUNT(*) as total_orders,
          COALESCE(SUM(CASE WHEN items IS NOT NULL THEN
            (SELECT SUM((item->>'quantity')::int)
             FROM jsonb_array_elements(items) AS item)
          END), 0) as products_sold
        FROM orders
        ${dateFilter}
        AND status = 'completed'
      `, params);

      // Get new customers today
      const { count: new_customers } = await db.one(`
        SELECT COUNT(*) FROM customers
        WHERE created_at::date = CURRENT_DATE
      `);

      const result = {
        totalSales: {
          value: parseFloat(metrics.total_sales),
          currency: 'USD',
          change: 8.0,
          changeType: 'increase'
        },
        totalOrders: {
          value: parseInt(metrics.total_orders),
          change: 5.0,
          changeType: 'increase'
        },
        productsSold: {
          value: parseInt(metrics.products_sold),
          change: 1.2,
          changeType: 'increase'
        },
        newCustomers: {
          value: parseInt(new_customers),
          change: 0.5,
          changeType: 'increase'
        }
      };

      // Cache for 5 minutes
      await redis.setex(cacheKey, 300, JSON.stringify(result));

      return successResponse(res, result);

    } catch (error) {
      next(error);
    }
  }

  async getRevenueData(req, res, next) {
    try {
      const { period = 'week' } = req.query;

      const cacheKey = `dashboard:revenue:${period}`;

      // Check cache
      const cached = await redis.get(cacheKey);
      if (cached) {
        return successResponse(res, JSON.parse(cached));
      }

      // Query based on period
      let query;
      if (period === 'week') {
        query = `
          SELECT
            TO_CHAR(created_at, 'Day') as label,
            SUM(CASE WHEN order_type = 'online' THEN total_amount ELSE 0 END) as online,
            SUM(CASE WHEN order_type = 'offline' THEN total_amount ELSE 0 END) as offline
          FROM orders
          WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
          AND status = 'completed'
          GROUP BY EXTRACT(DOW FROM created_at), TO_CHAR(created_at, 'Day')
          ORDER BY EXTRACT(DOW FROM created_at)
        `;
      }

      const data = await db.any(query);

      const result = {
        labels: data.map(d => d.label.trim()),
        online: data.map(d => parseFloat(d.online)),
        offline: data.map(d => parseFloat(d.offline))
      };

      // Cache for 10 minutes
      await redis.setex(cacheKey, 600, JSON.stringify(result));

      return successResponse(res, result);

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
```

---

## Email Integration

### services/email.service.js (SendGrid)
```javascript
const sgMail = require('@sendgrid/mail');
const db = require('../config/database');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
  async sendCampaign(campaignId) {
    try {
      // Get campaign details
      const campaign = await db.one(
        'SELECT * FROM email_campaigns WHERE id = $1',
        [campaignId]
      );

      // Get recipients
      let recipients;
      if (campaign.recipient_type === 'all') {
        recipients = await db.any('SELECT email, name FROM customers');
      } else if (campaign.recipient_type === 'with_orders') {
        recipients = await db.any(
          'SELECT email, name FROM customers WHERE total_orders > 0'
        );
      } else if (campaign.recipient_type === 'without_orders') {
        recipients = await db.any(
          'SELECT email, name FROM customers WHERE total_orders = 0'
        );
      } else if (campaign.recipient_type === 'custom') {
        recipients = await db.any(
          'SELECT email, name FROM customers WHERE id = ANY($1)',
          [campaign.recipient_ids]
        );
      }

      // Send emails
      const messages = recipients.map(recipient => ({
        to: recipient.email,
        from: process.env.EMAIL_FROM,
        subject: campaign.subject,
        html: campaign.body.replace('{{customer_name}}', recipient.name)
      }));

      const results = await sgMail.send(messages);

      // Update campaign
      await db.none(`
        UPDATE email_campaigns
        SET
          sent_count = $1,
          status = 'sent',
          sent_at = NOW()
        WHERE id = $2
      `, [recipients.length, campaignId]);

      return {
        sentCount: recipients.length,
        status: 'sent'
      };

    } catch (error) {
      // Update campaign as failed
      await db.none(
        `UPDATE email_campaigns
         SET status = 'failed', sent_at = NOW()
         WHERE id = $1`,
        [campaignId]
      );

      throw error;
    }
  }

  async trackOpen(campaignId, customerId) {
    await db.none(`
      UPDATE email_campaigns
      SET opened_count = opened_count + 1
      WHERE id = $1
    `, [campaignId]);
  }

  async trackClick(campaignId, customerId) {
    await db.none(`
      UPDATE email_campaigns
      SET clicked_count = clicked_count + 1
      WHERE id = $1
    `, [campaignId]);
  }
}

module.exports = new EmailService();
```

---

## SMS/WhatsApp Integration

### services/sms.service.js (Twilio)
```javascript
const twilio = require('twilio');
const db = require('../config/database');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

class SMSService {
  async sendMessage(messageId) {
    try {
      // Get message details
      const message = await db.one(
        'SELECT * FROM messages WHERE id = $1',
        [messageId]
      );

      // Get recipients
      let recipients;
      if (message.recipient_type === 'all') {
        recipients = await db.any(
          'SELECT phone, name FROM customers WHERE phone IS NOT NULL'
        );
      } else if (message.recipient_type === 'custom') {
        recipients = await db.any(
          'SELECT phone, name FROM customers WHERE id = ANY($1) AND phone IS NOT NULL',
          [message.recipient_ids]
        );
      }

      // Send messages
      const promises = recipients.map(recipient =>
        client.messages.create({
          body: message.content.replace('{{customer_name}}', recipient.name),
          from: process.env.TWILIO_PHONE_NUMBER,
          to: recipient.phone
        })
      );

      const results = await Promise.allSettled(promises);

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      // Update message
      await db.none(`
        UPDATE messages
        SET
          sent_count = $1,
          delivered_count = $2,
          failed_count = $3,
          delivery_rate = ($2::decimal / $1 * 100),
          status = 'sent',
          sent_at = NOW()
        WHERE id = $4
      `, [recipients.length, successful, failed, messageId]);

      return {
        sentCount: recipients.length,
        deliveredCount: successful,
        failedCount: failed
      };

    } catch (error) {
      await db.none(
        `UPDATE messages SET status = 'failed', sent_at = NOW() WHERE id = $1`,
        [messageId]
      );
      throw error;
    }
  }
}

module.exports = new SMSService();
```

---

## Real-time Updates

### WebSocket Setup
```javascript
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

function setupWebSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
}

// Emit events
function emitNewOrder(io, orderData) {
  io.emit('order:created', orderData);
}

function emitNewCustomer(io, customerData) {
  io.emit('customer:registered', customerData);
}

module.exports = { setupWebSocket, emitNewOrder, emitNewCustomer };
```

---

## Utilities

### utils/response.js
```javascript
exports.successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  });
};

exports.errorResponse = (res, message, statusCode = 500, code = 'INTERNAL_ERROR') => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message
    },
    timestamp: new Date().toISOString()
  });
};
```

### middleware/error.middleware.js
```javascript
const errorMiddleware = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';

  // Validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
    code = 'VALIDATION_ERROR';
  }

  // Database errors
  if (err.code === '23505') { // Unique violation
    statusCode = 409;
    message = 'Resource already exists';
    code = 'CONFLICT';
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    },
    timestamp: new Date().toISOString()
  });
};

module.exports = errorMiddleware;
```

---

## package.json
```json
{
  "name": "cateredbyafrica-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "test": "jest --coverage"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.0.3",
    "pg-promise": "^11.5.4",
    "ioredis": "^5.3.2",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "@sendgrid/mail": "^7.7.0",
    "twilio": "^4.18.1",
    "socket.io": "^4.6.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.5.0",
    "supertest": "^6.3.3"
  }
}
```

---

**Last Updated**: December 1, 2025
