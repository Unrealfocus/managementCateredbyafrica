# Catered by Africa - Backend API

Production-ready Node.js backend for the Sales & Customer Management Dashboard.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
nano .env

# Run database migrations (see ../docs/DATABASE_SETUP.md)
psql -U postgres -f ../docs/database_schema.sql

# Start development server
npm run dev
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.js   # PostgreSQL connection
│   │   └── redis.js      # Redis connection & helpers
│   ├── controllers/      # Request handlers
│   │   └── auth.controller.js
│   ├── middleware/       # Express middleware
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── rateLimit.middleware.js
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Helper functions
│   │   ├── errors.js
│   │   └── response.js
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── .env.example         # Environment template
├── .gitignore
├── package.json
└── README.md
```

## ✅ Implemented Features

### Core Infrastructure
- ✅ Express.js server with TypeScript-ready structure
- ✅ PostgreSQL database connection with pg-promise
- ✅ Redis caching and session storage
- ✅ JWT authentication with refresh tokens
- ✅ Rate limiting with Redis store
- ✅ Error handling middleware
- ✅ CORS configuration
- ✅ Request compression
- ✅ Security headers (Helmet)
- ✅ Request logging (Morgan)
- ✅ Graceful shutdown handling
- ✅ Socket.IO for real-time features

### Authentication
- ✅ Login endpoint with JWT
- ✅ Refresh token mechanism
- ✅ Logout endpoint
- ✅ Get current user endpoint
- ✅ Role-based access control middleware
- ✅ Session management in database

### Middleware
- ✅ Authentication middleware
- ✅ Role-based authorization
- ✅ Error handling
- ✅ Rate limiting (auth, API, strict)
- ✅ Request validation ready

### Utilities
- ✅ Success/Error response helpers
- ✅ Custom error classes
- ✅ Redis cache helpers

## 🔨 To Be Added

Create these controllers following the pattern in `auth.controller.js`:

### Controllers
- `customer.controller.js` - Customer CRUD operations
- `dashboard.controller.js` - Analytics and metrics
- `email.controller.js` - Email campaign management
- `message.controller.js` - SMS/WhatsApp messaging
- `automation.controller.js` - Marketing automation
- `order.controller.js` - Order management
- `product.controller.js` - Product catalog

### Services
- `email.service.js` - SendGrid integration
- `sms.service.js` - Twilio integration
- `automation.service.js` - Rule execution
- `analytics.service.js` - Data aggregation

### Routes
- `auth.routes.js` - Authentication routes
- `customer.routes.js` - Customer routes
- `dashboard.routes.js` - Dashboard routes
- `email.routes.js` - Email routes
- `message.routes.js` - Messaging routes
- `automation.routes.js` - Automation routes
- `index.js` - Route aggregator

## 🔌 API Endpoints

See `/docs/BACKEND_API_DOCUMENTATION.md` for complete API reference.

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

### Customers (To be implemented)
- `GET /api/v1/customers` - List customers
- `GET /api/v1/customers/:id` - Get customer
- `POST /api/v1/customers` - Create customer
- `PUT /api/v1/customers/:id` - Update customer
- `DELETE /api/v1/customers/:id` - Delete customer

### Dashboard (To be implemented)
- `GET /api/v1/dashboard/metrics` - Dashboard metrics
- `GET /api/v1/dashboard/revenue` - Revenue data
- `GET /api/v1/dashboard/visitors` - Visitor insights
- `GET /api/v1/dashboard/top-products` - Top products

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm test -- --coverage
```

## 🔒 Environment Variables

Required environment variables (see `.env.example`):

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/database
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_secret_here
REFRESH_TOKEN_SECRET=your_refresh_secret_here
SENDGRID_API_KEY=your_sendgrid_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

## 📊 Database

Run the database setup from the docs:

```bash
# Create database and tables
psql -U postgres -f ../docs/database_schema.sql

# Seed with sample data (optional)
psql -U postgres -f ../docs/seed_data.sql
```

## 🚢 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production DATABASE_URL
- [ ] Set strong JWT secrets
- [ ] Configure SendGrid/Twilio
- [ ] Enable SSL/HTTPS
- [ ] Set up process manager (PM2)
- [ ] Configure reverse proxy (Nginx)
- [ ] Enable monitoring (New Relic, Datadog)
- [ ] Set up log aggregation
- [ ] Configure backups

### PM2 Deployment

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start src/server.js --name cateredbyafrica-api

# Enable auto-restart on server reboot
pm2 startup
pm2 save

# Monitor
pm2 monit
```

## 📝 Development Guidelines

### Adding a New Controller

1. Create controller in `src/controllers/`
2. Follow async/await pattern
3. Use try/catch with `next(error)`
4. Use response helpers from `utils/response.js`
5. Throw custom errors from `utils/errors.js`

Example:
```javascript
const { successResponse } = require('../utils/response');
const { NotFoundError } = require('../utils/errors');

class MyController {
  async getItem(req, res, next) {
    try {
      const item = await db.one('SELECT * FROM items WHERE id = $1', [req.params.id]);
      if (!item) {
        throw new NotFoundError('Item not found');
      }
      return successResponse(res, item);
    } catch (error) {
      next(error);
    }
  }
}
```

### Adding a New Route

1. Create route file in `src/routes/`
2. Apply appropriate middleware
3. Export router
4. Import in `src/routes/index.js`

Example:
```javascript
const express = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const controller = require('../controllers/my.controller');

const router = express.Router();

router.get('/', authMiddleware, controller.getAll);
router.post('/', authMiddleware, controller.create);

module.exports = router;
```

## 🐛 Debugging

```bash
# Enable debug logging
DEBUG=* npm run dev

# Check database connection
node -e "require('./src/config/database').testConnection()"

# Check Redis connection
redis-cli ping
```

## 📚 Documentation

- [Complete API Documentation](../docs/BACKEND_API_DOCUMENTATION.md)
- [Database Setup Guide](../docs/DATABASE_SETUP.md)
- [Implementation Examples](../docs/BACKEND_IMPLEMENTATION_EXAMPLES.md)

## 🤝 Contributing

1. Follow existing code patterns
2. Add JSDoc comments to functions
3. Write tests for new features
4. Update API documentation
5. Test locally before committing

## 📄 License

MIT License - Catered by Africa

---

**Current Status**: Core infrastructure complete, ready for controller implementation

**Next Steps**:
1. Implement remaining controllers
2. Create route files
3. Add service integrations (SendGrid, Twilio)
4. Write tests
5. Deploy to production
