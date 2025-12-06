const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { apiLimiter } = require('../middleware/rateLimit.middleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Apply rate limiting
router.use(apiLimiter);

/**
 * @route   GET /api/v1/orders
 * @desc    Get all orders
 * @access  Private
 */
router.get('/', orderController.getAllOrders);

/**
 * @route   GET /api/v1/orders/stats
 * @desc    Get order statistics
 * @access  Private
 */
router.get('/stats', orderController.getOrderStats);

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get('/:id', orderController.getOrderById);

/**
 * @route   POST /api/v1/orders
 * @desc    Create new order
 * @access  Private
 */
router.post('/', orderController.createOrder);

/**
 * @route   PUT /api/v1/orders/:id
 * @desc    Update order
 * @access  Private
 */
router.put('/:id', orderController.updateOrder);

/**
 * @route   PATCH /api/v1/orders/:id/status
 * @desc    Update order status
 * @access  Private
 */
router.patch('/:id/status', orderController.updateOrderStatus);

/**
 * @route   DELETE /api/v1/orders/:id
 * @desc    Delete order
 * @access  Private
 */
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
