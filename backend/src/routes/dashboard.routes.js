const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { apiLimiter } = require('../middleware/rateLimit.middleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Apply rate limiting
router.use(apiLimiter);

/**
 * @route   GET /api/v1/dashboard/metrics
 * @desc    Get dashboard metrics
 * @access  Private
 */
router.get('/metrics', dashboardController.getMetrics);

/**
 * @route   GET /api/v1/dashboard/revenue
 * @desc    Get revenue chart data
 * @access  Private
 */
router.get('/revenue', dashboardController.getRevenueData);

/**
 * @route   GET /api/v1/dashboard/visitors
 * @desc    Get visitor insights
 * @access  Private
 */
router.get('/visitors', dashboardController.getVisitorInsights);

/**
 * @route   GET /api/v1/dashboard/top-products
 * @desc    Get top products
 * @access  Private
 */
router.get('/top-products', dashboardController.getTopProducts);

/**
 * @route   GET /api/v1/dashboard/satisfaction
 * @desc    Get customer satisfaction data
 * @access  Private
 */
router.get('/satisfaction', dashboardController.getCustomerSatisfaction);

/**
 * @route   GET /api/v1/dashboard/target-reality
 * @desc    Get target vs reality data
 * @access  Private
 */
router.get('/target-reality', dashboardController.getTargetVsReality);

module.exports = router;
