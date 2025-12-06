const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { apiLimiter, strictLimiter } = require('../middleware/rateLimit.middleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Apply rate limiting
router.use(apiLimiter);

/**
 * @route   GET /api/v1/messages/campaigns
 * @desc    Get all message campaigns
 * @access  Private
 */
router.get('/campaigns', messageController.getAllCampaigns);

/**
 * @route   GET /api/v1/messages/campaigns/:id
 * @desc    Get campaign by ID
 * @access  Private
 */
router.get('/campaigns/:id', messageController.getCampaignById);

/**
 * @route   POST /api/v1/messages/campaigns
 * @desc    Create new campaign
 * @access  Private
 */
router.post('/campaigns', messageController.createCampaign);

/**
 * @route   PUT /api/v1/messages/campaigns/:id
 * @desc    Update campaign
 * @access  Private
 */
router.put('/campaigns/:id', messageController.updateCampaign);

/**
 * @route   DELETE /api/v1/messages/campaigns/:id
 * @desc    Delete campaign
 * @access  Private
 */
router.delete('/campaigns/:id', messageController.deleteCampaign);

/**
 * @route   POST /api/v1/messages/campaigns/:id/send
 * @desc    Send campaign
 * @access  Private
 */
router.post('/campaigns/:id/send', strictLimiter, messageController.sendCampaign);

/**
 * @route   POST /api/v1/messages/campaigns/:id/test
 * @desc    Send test message
 * @access  Private
 */
router.post('/campaigns/:id/test', messageController.sendTestMessage);

/**
 * @route   GET /api/v1/messages/campaigns/:id/stats
 * @desc    Get campaign statistics
 * @access  Private
 */
router.get('/campaigns/:id/stats', messageController.getCampaignStats);

/**
 * @route   GET /api/v1/messages/templates
 * @desc    Get message templates
 * @access  Private
 */
router.get('/templates', messageController.getTemplates);

/**
 * @route   GET /api/v1/messages/templates/:id
 * @desc    Get template by ID
 * @access  Private
 */
router.get('/templates/:id', messageController.getTemplateById);

/**
 * @route   POST /api/v1/messages/send
 * @desc    Send single message (direct send)
 * @access  Private
 */
router.post('/send', strictLimiter, messageController.sendSingleMessage);

/**
 * @route   GET /api/v1/messages/analytics
 * @desc    Get messaging analytics overview
 * @access  Private
 */
router.get('/analytics', messageController.getAnalytics);

module.exports = router;
