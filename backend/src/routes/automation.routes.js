const express = require('express');
const router = express.Router();
const automationController = require('../controllers/automation.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { apiLimiter, strictLimiter } = require('../middleware/rateLimit.middleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Apply rate limiting
router.use(apiLimiter);

/**
 * @route   GET /api/v1/automation/rules
 * @desc    Get all automation rules
 * @access  Private
 */
router.get('/rules', automationController.getAllRules);

/**
 * @route   GET /api/v1/automation/rules/:id
 * @desc    Get rule by ID
 * @access  Private
 */
router.get('/rules/:id', automationController.getRuleById);

/**
 * @route   POST /api/v1/automation/rules
 * @desc    Create new automation rule
 * @access  Private
 */
router.post('/rules', automationController.createRule);

/**
 * @route   PUT /api/v1/automation/rules/:id
 * @desc    Update automation rule
 * @access  Private
 */
router.put('/rules/:id', automationController.updateRule);

/**
 * @route   DELETE /api/v1/automation/rules/:id
 * @desc    Delete automation rule
 * @access  Private
 */
router.delete('/rules/:id', automationController.deleteRule);

/**
 * @route   POST /api/v1/automation/rules/:id/toggle
 * @desc    Toggle rule active status
 * @access  Private
 */
router.post('/rules/:id/toggle', automationController.toggleRule);

/**
 * @route   POST /api/v1/automation/rules/:id/execute
 * @desc    Execute rule manually
 * @access  Private
 */
router.post('/rules/:id/execute', strictLimiter, automationController.executeRule);

/**
 * @route   GET /api/v1/automation/rules/:id/logs
 * @desc    Get execution logs
 * @access  Private
 */
router.get('/rules/:id/logs', automationController.getExecutionLogs);

/**
 * @route   GET /api/v1/automation/analytics
 * @desc    Get automation analytics
 * @access  Private
 */
router.get('/analytics', automationController.getAnalytics);

/**
 * @route   POST /api/v1/automation/test
 * @desc    Test rule conditions
 * @access  Private
 */
router.post('/test', automationController.testRule);

module.exports = router;
