const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { apiLimiter } = require('../middleware/rateLimit.middleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Apply rate limiting
router.use(apiLimiter);

/**
 * @route   GET /api/v1/customers
 * @desc    Get all customers
 * @access  Private
 */
router.get('/', customerController.getAllCustomers);

/**
 * @route   GET /api/v1/customers/segmentation
 * @desc    Get customer segmentation
 * @access  Private
 */
router.get('/segmentation', customerController.getSegmentation);

/**
 * @route   GET /api/v1/customers/:id
 * @desc    Get customer by ID
 * @access  Private
 */
router.get('/:id', customerController.getCustomerById);

/**
 * @route   POST /api/v1/customers
 * @desc    Create new customer
 * @access  Private
 */
router.post('/', customerController.createCustomer);

/**
 * @route   PUT /api/v1/customers/:id
 * @desc    Update customer
 * @access  Private
 */
router.put('/:id', customerController.updateCustomer);

/**
 * @route   DELETE /api/v1/customers/:id
 * @desc    Delete customer
 * @access  Private
 */
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
