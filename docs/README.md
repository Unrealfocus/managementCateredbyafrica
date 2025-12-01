# Backend Documentation

This directory contains comprehensive documentation for implementing the backend API for the Catered by Africa Sales & Customer Management Dashboard.

## 📚 Documentation Files

### 1. [BACKEND_API_DOCUMENTATION.md](./BACKEND_API_DOCUMENTATION.md)
**Complete API Reference** - 95KB

The main API documentation file containing:
- All API endpoints with request/response examples
- Complete database schema
- Authentication flow (JWT + refresh tokens)
- Data models and TypeScript interfaces
- WebSocket events for real-time updates
- Error codes and handling
- Rate limiting configuration
- Webhooks setup
- Security best practices
- Environment variables
- Deployment checklist

**Use this when:** You need to understand the API structure, endpoints, or data models.

---

### 2. [DATABASE_SETUP.md](./DATABASE_SETUP.md)
**Database Installation & Configuration** - 30KB

Step-by-step guide for database setup:
- PostgreSQL installation (Ubuntu, macOS, Windows)
- Complete SQL schema with all tables
- Database triggers and functions
- Seed data for testing
- Redis setup and configuration
- Backup and restore procedures
- Performance monitoring queries
- Troubleshooting common issues

**Use this when:** Setting up the database for the first time or migrating to production.

---

### 3. [BACKEND_IMPLEMENTATION_EXAMPLES.md](./BACKEND_IMPLEMENTATION_EXAMPLES.md)
**Code Examples & Implementation Guide** - 22KB

Practical code examples for backend implementation:
- Complete project structure
- Express.js server setup
- Database connection (Sequelize & pg-promise)
- Redis integration
- Authentication implementation
- Middleware examples
- Controller implementations
- Email service (SendGrid)
- SMS service (Twilio)
- WebSocket real-time updates
- Utility functions
- Error handling

**Use this when:** Starting to code the backend or looking for implementation examples.

---

## 🚀 Quick Start

### 1. Set Up Database
```bash
# Follow DATABASE_SETUP.md
psql -U postgres -f docs/database_setup.sql
```

### 2. Install Dependencies
```bash
npm install express pg-promise ioredis bcryptjs jsonwebtoken
npm install @sendgrid/mail twilio socket.io
npm install cors helmet morgan dotenv
```

### 3. Configure Environment
```bash
# Create .env file
cp .env.example .env

# Edit with your credentials
nano .env
```

### 4. Start Development Server
```bash
npm run dev
```

---

## 📋 Technology Stack

### Core
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **Cache**: Redis 6+

### Authentication
- **JWT** for access tokens
- **Refresh tokens** for session management
- **bcrypt** for password hashing

### Communications
- **SendGrid** for email campaigns
- **Twilio** for SMS/WhatsApp
- **Socket.io** for real-time updates

### Security
- **helmet** for HTTP headers
- **cors** for cross-origin requests
- **Rate limiting** with Redis
- **SSL/TLS** for production

---

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/          # Database, Redis, environment
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth, validation, errors
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   ├── app.js          # Express app
│   └── server.js       # Entry point
├── tests/              # Test files
├── docs/               # This documentation
├── .env.example        # Environment template
└── package.json        # Dependencies
```

---

## 🔐 Security Checklist

- [ ] Use environment variables for secrets
- [ ] Enable HTTPS in production
- [ ] Implement rate limiting
- [ ] Validate all user input
- [ ] Use parameterized queries
- [ ] Enable CORS properly
- [ ] Set secure HTTP headers (helmet)
- [ ] Hash passwords with bcrypt
- [ ] Use short-lived JWT tokens
- [ ] Implement refresh token rotation
- [ ] Log authentication attempts
- [ ] Set up monitoring and alerts

---

## 📊 API Endpoints Summary

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout

### Dashboard
- `GET /api/v1/dashboard/metrics` - Dashboard metrics
- `GET /api/v1/dashboard/revenue` - Revenue chart data
- `GET /api/v1/dashboard/visitors` - Visitor insights
- `GET /api/v1/dashboard/top-products` - Top products

### Customers
- `GET /api/v1/customers` - List all customers
- `GET /api/v1/customers/:id` - Get customer details
- `POST /api/v1/customers` - Create customer
- `PUT /api/v1/customers/:id` - Update customer
- `DELETE /api/v1/customers/:id` - Delete customer
- `GET /api/v1/customers/segmentation` - Customer segments

### Email Campaigns
- `GET /api/v1/emails/campaigns` - List campaigns
- `POST /api/v1/emails/campaigns` - Create campaign
- `POST /api/v1/emails/campaigns/:id/send` - Send campaign
- `GET /api/v1/emails/templates` - Email templates

### Messages (SMS/WhatsApp)
- `GET /api/v1/messages` - List messages
- `POST /api/v1/messages/send` - Send messages
- `GET /api/v1/messages/templates` - Message templates

### Automation
- `GET /api/v1/automation/rules` - List automation rules
- `POST /api/v1/automation/rules` - Create rule
- `PUT /api/v1/automation/rules/:id` - Update rule
- `DELETE /api/v1/automation/rules/:id` - Delete rule
- `GET /api/v1/automation/rules/:id/logs` - Rule logs

### Orders
- `GET /api/v1/orders` - List orders
- `POST /api/v1/orders` - Create order
- `PATCH /api/v1/orders/:id/status` - Update order status

### Products
- `GET /api/v1/products` - List products
- `POST /api/v1/products` - Create product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product

---

## 🧪 Testing

### Run Tests
```bash
# All tests
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Example Test
```javascript
describe('Customer API', () => {
  it('should create a new customer', async () => {
    const response = await request(app)
      .post('/api/v1/customers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Customer',
        email: 'test@example.com'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

---

## 🔍 Common Issues & Solutions

### Issue: Database connection fails
**Solution**: Check your `DATABASE_URL` in `.env` and ensure PostgreSQL is running.

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart if needed
sudo systemctl restart postgresql
```

### Issue: Redis connection error
**Solution**: Ensure Redis is running on the correct port.

```bash
# Check Redis
redis-cli ping

# Should return: PONG
```

### Issue: JWT token expired
**Solution**: Use the refresh token endpoint to get a new access token.

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "your_refresh_token"}'
```

### Issue: Email not sending
**Solution**: Verify SendGrid API key and sender email.

```bash
# Test SendGrid API key
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer YOUR_SENDGRID_API_KEY" \
  -H "Content-Type: application/json"
```

---

## 📈 Performance Optimization

### Database
- Create indexes on frequently queried columns
- Use connection pooling
- Implement query result caching with Redis
- Run `ANALYZE` regularly

### API
- Enable response compression (gzip)
- Implement request caching
- Use pagination for large datasets
- Optimize database queries (avoid N+1)

### Redis Caching Strategy
```javascript
// Cache dashboard metrics for 5 minutes
redis.setex('dashboard:metrics', 300, JSON.stringify(data));

// Cache customer data for 1 hour
redis.setex(`customer:${id}`, 3600, JSON.stringify(customer));
```

---

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure SSL certificates
- [ ] Enable database backups
- [ ] Set up monitoring (PM2, New Relic)
- [ ] Configure log rotation
- [ ] Enable rate limiting
- [ ] Set up CDN for static assets
- [ ] Configure load balancer
- [ ] Set up CI/CD pipeline
- [ ] Enable error tracking (Sentry)

### Environment Variables
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your_secret
SENDGRID_API_KEY=your_key
TWILIO_ACCOUNT_SID=your_sid
```

---

## 📞 Support

For questions or issues:
- Review the documentation files in this directory
- Check the troubleshooting section
- Consult the implementation examples
- Review the API specification

---

## 📝 Contributing

When updating the backend:
1. Update the relevant documentation file
2. Add code examples if applicable
3. Update the API changelog
4. Test all changes thoroughly
5. Update this README if structure changes

---

## 📄 License

This documentation is part of the Catered by Africa project.

---

**Last Updated**: December 1, 2025
**Documentation Version**: 1.0.0
**API Version**: v1
