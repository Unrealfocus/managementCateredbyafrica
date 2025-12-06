const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { apiLimiter, strictLimiter } = require('../middleware/rateLimit.middleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Apply rate limiting
router.use(apiLimiter);

/**
 * @route   GET /api/v1/emails/campaigns
 * @desc    Get all email campaigns
 * @access  Private
 */
router.get('/campaigns', emailController.getAllCampaigns);

/**
 * @route   GET /api/v1/emails/campaigns/:id
 * @desc    Get campaign by ID
 * @access  Private
 */
router.get('/campaigns/:id', emailController.getCampaignById);

/**
 * @route   POST /api/v1/emails/campaigns
 * @desc    Create new campaign
 * @access  Private
 */
router.post('/campaigns', emailController.createCampaign);

/**
 * @route   PUT /api/v1/emails/campaigns/:id
 * @desc    Update campaign
 * @access  Private
 */
router.put('/campaigns/:id', emailController.updateCampaign);

/**
 * @route   DELETE /api/v1/emails/campaigns/:id
 * @desc    Delete campaign
 * @access  Private
 */
router.delete('/campaigns/:id', emailController.deleteCampaign);

/**
 * @route   POST /api/v1/emails/campaigns/:id/send
 * @desc    Send campaign
 * @access  Private
 */
router.post('/campaigns/:id/send', strictLimiter, emailController.sendCampaign);

/**
 * @route   POST /api/v1/emails/campaigns/:id/test
 * @desc    Send test email
 * @access  Private
 */
router.post('/campaigns/:id/test', emailController.sendTestEmail);

/**
 * @route   GET /api/v1/emails/campaigns/:id/stats
 * @desc    Get campaign statistics
 * @access  Private
 */
router.get('/campaigns/:id/stats', emailController.getCampaignStats);

/**
 * @route   GET /api/v1/emails/templates
 * @desc    Get email templates
 * @access  Private
 */
router.get('/templates', emailController.getTemplates);

/**
 * @route   GET /api/v1/emails/templates/:id
 * @desc    Get template by ID
 * @access  Private
 */
router.get('/templates/:id', emailController.getTemplateById);

/**
 * @route   GET /api/v1/emails/analytics
 * @desc    Get email analytics overview
 * @access  Private
 */
router.get('/analytics', emailController.getAnalytics);

module.exports = router;
