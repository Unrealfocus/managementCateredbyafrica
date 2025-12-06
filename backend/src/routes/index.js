const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const customerRoutes = require('./customer.routes');
const dashboardRoutes = require('./dashboard.routes');
const emailRoutes = require('./email.routes');
const messageRoutes = require('./message.routes');
const automationRoutes = require('./automation.routes');
const orderRoutes = require('./order.routes');
const productRoutes = require('./product.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/emails', emailRoutes);
router.use('/messages', messageRoutes);
router.use('/automation', automationRoutes);
router.use('/orders', orderRoutes);
router.use('/products', productRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Management Catered by Africa API',
    version: process.env.API_VERSION || 'v1',
    endpoints: {
      auth: '/auth',
      customers: '/customers',
      dashboard: '/dashboard',
      emails: '/emails',
      messages: '/messages',
      automation: '/automation',
      orders: '/orders',
      products: '/products'
    },
    documentation: '/docs',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
