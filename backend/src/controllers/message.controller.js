const { db } = require('../config/database');
const { cacheHelper } = require('../config/redis');
const { successResponse } = require('../utils/response');
const { ValidationError, NotFoundError } = require('../utils/errors');
const smsService = require('../services/sms.service');

class MessageController {
  /**
   * Get all message campaigns
   */
  async getAllCampaigns(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        messageType,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = req.query;

      const offset = (page - 1) * limit;

      // Build filter
      const filters = [];
      const params = [];
      let paramCount = 1;

      if (status) {
        filters.push(`status = $${paramCount++}`);
        params.push(status);
      }

      if (messageType) {
        filters.push(`message_type = $${paramCount++}`);
        params.push(messageType);
      }

      const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

      // Allowed sort columns
      const allowedSort = ['created_at', 'sent_at', 'name', 'sent_count'];
      const sortColumn = allowedSort.includes(sortBy) ? sortBy : 'created_at';
      const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

      // Get campaigns
      params.push(limit, offset);
      const campaigns = await db.any(`
        SELECT
          id,
          name,
          message_type,
          segment,
          status,
          sent_count,
          failed_count,
          total_recipients,
          created_at,
          sent_at
        FROM message_campaigns
        ${whereClause}
        ORDER BY ${sortColumn} ${order}
        LIMIT $${paramCount++} OFFSET $${paramCount++}
      `, params);

      // Get total count
      const { count } = await db.one(`
        SELECT COUNT(*) FROM message_campaigns ${whereClause}
      `, params.slice(0, -2)); // Remove limit and offset params

      return successResponse(res, {
        campaigns,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(count),
          pages: Math.ceil(count / limit)
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get campaign by ID
   */
  async getCampaignById(req, res, next) {
    try {
      const { id } = req.params;

      const campaign = await db.oneOrNone(
        'SELECT * FROM message_campaigns WHERE id = $1',
        [id]
      );

      if (!campaign) {
        throw new NotFoundError('Campaign not found');
      }

      // Get campaign stats if sent
      let stats = null;
      if (campaign.status === 'sent') {
        stats = await smsService.getCampaignStats(id);
      }

      return successResponse(res, {
        campaign,
        stats
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new campaign
   */
  async createCampaign(req, res, next) {
    try {
      const {
        name,
        messageContent,
        messageType,
        segment,
        customerIds = null,
        fromNumber = null,
        mediaUrl = null,
        scheduledFor = null
      } = req.body;

      // Validate required fields
      if (!name || !messageContent || !messageType || !segment) {
        throw new ValidationError('Name, message content, message type, and segment are required');
      }

      // Validate message type
      const validTypes = ['sms', 'whatsapp'];
      if (!validTypes.includes(messageType)) {
        throw new ValidationError(`Invalid message type. Must be one of: ${validTypes.join(', ')}`);
      }

      // Validate segment
      const validSegments = ['all', 'with_orders', 'without_orders', 'custom'];
      if (!validSegments.includes(segment)) {
        throw new ValidationError(`Invalid segment. Must be one of: ${validSegments.join(', ')}`);
      }

      if (segment === 'custom' && (!customerIds || customerIds.length === 0)) {
        throw new ValidationError('Customer IDs are required for custom segment');
      }

      // Validate template
      const validation = smsService.validateTemplate(messageContent, messageType);
      if (validation.warnings.length > 0) {
        console.warn('Template warnings:', validation.warnings);
      }

      // Create campaign
      const campaign = await db.one(`
        INSERT INTO message_campaigns (
          name,
          message_content,
          message_type,
          segment,
          customer_ids,
          from_number,
          media_url,
          scheduled_for,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        name,
        messageContent,
        messageType,
        segment,
        customerIds,
        fromNumber,
        mediaUrl,
        scheduledFor,
        scheduledFor ? 'scheduled' : 'draft'
      ]);

      return successResponse(res, {
        campaign,
        validation
      }, 'Campaign created successfully', 201);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Update campaign
   */
  async updateCampaign(req, res, next) {
    try {
      const { id } = req.params;
      const {
        name,
        messageContent,
        messageType,
        segment,
        customerIds,
        fromNumber,
        mediaUrl,
        scheduledFor
      } = req.body;

      // Check if campaign exists and is not sent
      const existing = await db.oneOrNone(
        'SELECT status FROM message_campaigns WHERE id = $1',
        [id]
      );

      if (!existing) {
        throw new NotFoundError('Campaign not found');
      }

      if (existing.status === 'sent') {
        throw new ValidationError('Cannot update a campaign that has already been sent');
      }

      // Build update query dynamically
      const updates = [];
      const params = [];
      let paramCount = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramCount++}`);
        params.push(name);
      }
      if (messageContent !== undefined) {
        updates.push(`message_content = $${paramCount++}`);
        params.push(messageContent);
      }
      if (messageType !== undefined) {
        updates.push(`message_type = $${paramCount++}`);
        params.push(messageType);
      }
      if (segment !== undefined) {
        updates.push(`segment = $${paramCount++}`);
        params.push(segment);
      }
      if (customerIds !== undefined) {
        updates.push(`customer_ids = $${paramCount++}`);
        params.push(customerIds);
      }
      if (fromNumber !== undefined) {
        updates.push(`from_number = $${paramCount++}`);
        params.push(fromNumber);
      }
      if (mediaUrl !== undefined) {
        updates.push(`media_url = $${paramCount++}`);
        params.push(mediaUrl);
      }
      if (scheduledFor !== undefined) {
        updates.push(`scheduled_for = $${paramCount++}`);
        params.push(scheduledFor);
        updates.push(`status = $${paramCount++}`);
        params.push(scheduledFor ? 'scheduled' : 'draft');
      }

      if (updates.length === 0) {
        throw new ValidationError('No fields to update');
      }

      updates.push(`updated_at = NOW()`);
      params.push(id);

      const campaign = await db.one(`
        UPDATE message_campaigns
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `, params);

      return successResponse(res, campaign, 'Campaign updated successfully');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(req, res, next) {
    try {
      const { id } = req.params;

      // Check if campaign exists
      const existing = await db.oneOrNone(
        'SELECT status FROM message_campaigns WHERE id = $1',
        [id]
      );

      if (!existing) {
        throw new NotFoundError('Campaign not found');
      }

      if (existing.status === 'sending') {
        throw new ValidationError('Cannot delete a campaign that is currently sending');
      }

      // Delete campaign
      await db.none('DELETE FROM message_campaigns WHERE id = $1', [id]);

      return successResponse(res, null, 'Campaign deleted successfully');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Send campaign
   */
  async sendCampaign(req, res, next) {
    try {
      const { id } = req.params;

      // Check if campaign exists
      const campaign = await db.oneOrNone(
        'SELECT * FROM message_campaigns WHERE id = $1',
        [id]
      );

      if (!campaign) {
        throw new NotFoundError('Campaign not found');
      }

      if (campaign.status === 'sent') {
        throw new ValidationError('Campaign has already been sent');
      }

      if (campaign.status === 'sending') {
        throw new ValidationError('Campaign is currently being sent');
      }

      // Send campaign
      const result = await smsService.sendCampaign(id);

      return successResponse(res, result, 'Campaign sent successfully');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Send test message
   */
  async sendTestMessage(req, res, next) {
    try {
      const { id } = req.params;
      const { testPhone } = req.body;

      if (!testPhone) {
        throw new ValidationError('Test phone number is required');
      }

      // Validate phone number format
      if (!smsService.isValidPhoneNumber(testPhone)) {
        throw new ValidationError('Invalid phone number format. Use E.164 format (e.g., +1234567890)');
      }

      const campaign = await db.oneOrNone(
        'SELECT * FROM message_campaigns WHERE id = $1',
        [id]
      );

      if (!campaign) {
        throw new NotFoundError('Campaign not found');
      }

      // Send test message
      let result;
      if (campaign.message_type === 'sms') {
        result = await smsService.sendSMS({
          to: testPhone,
          message: `[TEST] ${campaign.message_content}`,
          from: campaign.from_number
        });
      } else if (campaign.message_type === 'whatsapp') {
        result = await smsService.sendWhatsApp({
          to: testPhone,
          message: `[TEST] ${campaign.message_content}`,
          mediaUrl: campaign.media_url
        });
      }

      return successResponse(res, result, 'Test message sent successfully');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get campaign statistics
   */
  async getCampaignStats(req, res, next) {
    try {
      const { id } = req.params;

      const campaign = await db.oneOrNone(
        'SELECT status FROM message_campaigns WHERE id = $1',
        [id]
      );

      if (!campaign) {
        throw new NotFoundError('Campaign not found');
      }

      if (campaign.status !== 'sent') {
        throw new ValidationError('Statistics are only available for sent campaigns');
      }

      const stats = await smsService.getCampaignStats(id);

      // Get detailed logs
      const logs = await db.any(`
        SELECT
          DATE(sent_at) as date,
          status,
          COUNT(*) as count
        FROM message_logs
        WHERE campaign_id = $1
        GROUP BY DATE(sent_at), status
        ORDER BY date DESC
      `, [id]);

      return successResponse(res, {
        stats,
        logs
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get message templates
   */
  async getTemplates(req, res, next) {
    try {
      const { messageType } = req.query;

      let whereClause = '';
      const params = [];

      if (messageType) {
        whereClause = 'WHERE message_type = $1';
        params.push(messageType);
      }

      const templates = await db.any(`
        SELECT
          id,
          name,
          description,
          message_type,
          category,
          template_content,
          created_at
        FROM message_templates
        ${whereClause}
        ORDER BY category, name
      `, params);

      return successResponse(res, templates);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(req, res, next) {
    try {
      const { id } = req.params;

      const template = await db.oneOrNone(
        'SELECT * FROM message_templates WHERE id = $1',
        [id]
      );

      if (!template) {
        throw new NotFoundError('Template not found');
      }

      return successResponse(res, template);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Send single message (direct send)
   */
  async sendSingleMessage(req, res, next) {
    try {
      const { phone, message, messageType = 'sms', mediaUrl = null } = req.body;

      if (!phone || !message) {
        throw new ValidationError('Phone number and message are required');
      }

      if (!smsService.isValidPhoneNumber(phone)) {
        throw new ValidationError('Invalid phone number format. Use E.164 format (e.g., +1234567890)');
      }

      let result;
      if (messageType === 'sms') {
        result = await smsService.sendSMS({ to: phone, message });
      } else if (messageType === 'whatsapp') {
        result = await smsService.sendWhatsApp({ to: phone, message, mediaUrl });
      } else {
        throw new ValidationError('Invalid message type. Must be "sms" or "whatsapp"');
      }

      // Log the message
      await db.none(`
        INSERT INTO message_logs (phone, message_id, status, sent_at)
        VALUES ($1, $2, $3, NOW())
      `, [phone, result.messageId, 'sent']);

      return successResponse(res, result, 'Message sent successfully');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get messaging analytics overview
   */
  async getAnalytics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      const cacheKey = `messaging:analytics:${startDate || 'all'}:${endDate || 'all'}`;

      // Check cache
      const cached = await cacheHelper.get(cacheKey);
      if (cached) {
        return successResponse(res, cached);
      }

      // Build date filter
      let dateFilter = '';
      const params = [];
      if (startDate && endDate) {
        dateFilter = 'WHERE sent_at BETWEEN $1 AND $2';
        params.push(startDate, endDate);
      }

      // Get overview stats
      const overview = await db.one(`
        SELECT
          COUNT(*) as total_campaigns,
          COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_campaigns,
          COALESCE(SUM(sent_count), 0) as total_messages_sent,
          COALESCE(SUM(failed_count), 0) as total_failed,
          COUNT(CASE WHEN message_type = 'sms' THEN 1 END) as sms_campaigns,
          COUNT(CASE WHEN message_type = 'whatsapp' THEN 1 END) as whatsapp_campaigns
        FROM message_campaigns
        ${dateFilter}
      `, params);

      // Get delivery stats from logs
      const delivery = await db.one(`
        SELECT
          COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
          COUNT(CASE WHEN status = 'undelivered' THEN 1 END) as undelivered
        FROM message_logs
        ${dateFilter ? 'WHERE sent_at BETWEEN $1 AND $2' : ''}
      `, params);

      const result = {
        overview: {
          totalCampaigns: parseInt(overview.total_campaigns),
          sentCampaigns: parseInt(overview.sent_campaigns),
          totalMessagesSent: parseInt(overview.total_messages_sent),
          totalFailed: parseInt(overview.total_failed),
          smsCampaigns: parseInt(overview.sms_campaigns),
          whatsappCampaigns: parseInt(overview.whatsapp_campaigns)
        },
        delivery: {
          delivered: parseInt(delivery.delivered),
          failed: parseInt(delivery.failed),
          undelivered: parseInt(delivery.undelivered),
          deliveryRate: overview.total_messages_sent > 0
            ? ((parseInt(delivery.delivered) / parseInt(overview.total_messages_sent)) * 100).toFixed(2)
            : 0
        }
      };

      // Cache for 10 minutes
      await cacheHelper.set(cacheKey, result, 600);

      return successResponse(res, result);

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MessageController();
