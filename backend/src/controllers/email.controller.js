const { db } = require('../config/database');
const { cacheHelper } = require('../config/redis');
const { successResponse } = require('../utils/response');
const { ValidationError, NotFoundError } = require('../utils/errors');
const emailService = require('../services/email.service');

class EmailController {
  /**
   * Get all email campaigns
   */
  async getAllCampaigns(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = req.query;

      const offset = (page - 1) * limit;

      // Build filter
      let whereClause = '';
      const params = [];

      if (status) {
        whereClause = 'WHERE status = $1';
        params.push(status);
      }

      // Allowed sort columns
      const allowedSort = ['created_at', 'sent_at', 'name', 'sent_count'];
      const sortColumn = allowedSort.includes(sortBy) ? sortBy : 'created_at';
      const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

      // Get campaigns
      const campaigns = await db.any(`
        SELECT
          id,
          name,
          subject,
          segment,
          status,
          template_id,
          sent_count,
          total_recipients,
          created_at,
          sent_at
        FROM email_campaigns
        ${whereClause}
        ORDER BY ${sortColumn} ${order}
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `, [...params, limit, offset]);

      // Get total count
      const { count } = await db.one(`
        SELECT COUNT(*) FROM email_campaigns ${whereClause}
      `, params);

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
        'SELECT * FROM email_campaigns WHERE id = $1',
        [id]
      );

      if (!campaign) {
        throw new NotFoundError('Campaign not found');
      }

      // Get campaign stats if sent
      let stats = null;
      if (campaign.status === 'sent') {
        stats = await emailService.getEmailStats(id);
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
        subject,
        htmlContent,
        textContent,
        segment,
        customerIds = null,
        templateId = null,
        scheduledFor = null
      } = req.body;

      // Validate required fields
      if (!name || !subject || !segment) {
        throw new ValidationError('Name, subject, and segment are required');
      }

      if (!htmlContent && !templateId) {
        throw new ValidationError('Either HTML content or template ID is required');
      }

      // Validate segment
      const validSegments = ['all', 'with_orders', 'without_orders', 'custom'];
      if (!validSegments.includes(segment)) {
        throw new ValidationError(`Invalid segment. Must be one of: ${validSegments.join(', ')}`);
      }

      if (segment === 'custom' && (!customerIds || customerIds.length === 0)) {
        throw new ValidationError('Customer IDs are required for custom segment');
      }

      // Validate template if provided
      if (htmlContent) {
        const validation = emailService.validateTemplate(htmlContent);
        if (validation.warnings.length > 0) {
          console.warn('Template warnings:', validation.warnings);
        }
      }

      // Create campaign
      const campaign = await db.one(`
        INSERT INTO email_campaigns (
          name,
          subject,
          html_content,
          text_content,
          segment,
          customer_ids,
          template_id,
          scheduled_for,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        name,
        subject,
        htmlContent,
        textContent,
        segment,
        customerIds,
        templateId,
        scheduledFor,
        scheduledFor ? 'scheduled' : 'draft'
      ]);

      return successResponse(res, campaign, 'Campaign created successfully', 201);

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
        subject,
        htmlContent,
        textContent,
        segment,
        customerIds,
        templateId,
        scheduledFor
      } = req.body;

      // Check if campaign exists and is not sent
      const existing = await db.oneOrNone(
        'SELECT status FROM email_campaigns WHERE id = $1',
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
      if (subject !== undefined) {
        updates.push(`subject = $${paramCount++}`);
        params.push(subject);
      }
      if (htmlContent !== undefined) {
        updates.push(`html_content = $${paramCount++}`);
        params.push(htmlContent);
      }
      if (textContent !== undefined) {
        updates.push(`text_content = $${paramCount++}`);
        params.push(textContent);
      }
      if (segment !== undefined) {
        updates.push(`segment = $${paramCount++}`);
        params.push(segment);
      }
      if (customerIds !== undefined) {
        updates.push(`customer_ids = $${paramCount++}`);
        params.push(customerIds);
      }
      if (templateId !== undefined) {
        updates.push(`template_id = $${paramCount++}`);
        params.push(templateId);
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
        UPDATE email_campaigns
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
        'SELECT status FROM email_campaigns WHERE id = $1',
        [id]
      );

      if (!existing) {
        throw new NotFoundError('Campaign not found');
      }

      if (existing.status === 'sending') {
        throw new ValidationError('Cannot delete a campaign that is currently sending');
      }

      // Delete campaign (logs will be cascade deleted if foreign key is set up)
      await db.none('DELETE FROM email_campaigns WHERE id = $1', [id]);

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
        'SELECT * FROM email_campaigns WHERE id = $1',
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

      // Send campaign (this runs asynchronously)
      const result = await emailService.sendCampaign(id);

      return successResponse(res, result, 'Campaign sent successfully');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Send test email
   */
  async sendTestEmail(req, res, next) {
    try {
      const { id } = req.params;
      const { testEmail } = req.body;

      if (!testEmail) {
        throw new ValidationError('Test email address is required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(testEmail)) {
        throw new ValidationError('Invalid email address');
      }

      const campaign = await db.oneOrNone(
        'SELECT * FROM email_campaigns WHERE id = $1',
        [id]
      );

      if (!campaign) {
        throw new NotFoundError('Campaign not found');
      }

      // Send test email
      await emailService.sendEmail({
        to: testEmail,
        subject: `[TEST] ${campaign.subject}`,
        html: campaign.html_content,
        text: campaign.text_content,
        templateId: campaign.template_id
      });

      return successResponse(res, null, 'Test email sent successfully');

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
        'SELECT status FROM email_campaigns WHERE id = $1',
        [id]
      );

      if (!campaign) {
        throw new NotFoundError('Campaign not found');
      }

      if (campaign.status !== 'sent') {
        throw new ValidationError('Statistics are only available for sent campaigns');
      }

      const stats = await emailService.getEmailStats(id);

      // Get detailed logs
      const logs = await db.any(`
        SELECT
          DATE(sent_at) as date,
          status,
          COUNT(*) as count
        FROM email_logs
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
   * Get email templates
   */
  async getTemplates(req, res, next) {
    try {
      const templates = await db.any(`
        SELECT
          id,
          name,
          description,
          category,
          thumbnail_url,
          created_at
        FROM email_templates
        ORDER BY category, name
      `);

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
        'SELECT * FROM email_templates WHERE id = $1',
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
   * Get email analytics overview
   */
  async getAnalytics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      const cacheKey = `email:analytics:${startDate || 'all'}:${endDate || 'all'}`;

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
          COALESCE(SUM(sent_count), 0) as total_emails_sent,
          COALESCE(SUM(total_recipients), 0) as total_recipients
        FROM email_campaigns
        ${dateFilter}
      `, params);

      // Get engagement stats from logs
      const engagement = await db.one(`
        SELECT
          COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
          COUNT(CASE WHEN status = 'opened' THEN 1 END) as opened,
          COUNT(CASE WHEN status = 'clicked' THEN 1 END) as clicked,
          COUNT(CASE WHEN status = 'bounced' THEN 1 END) as bounced
        FROM email_logs
        ${dateFilter ? 'WHERE sent_at BETWEEN $1 AND $2' : ''}
      `, params);

      const result = {
        overview: {
          totalCampaigns: parseInt(overview.total_campaigns),
          sentCampaigns: parseInt(overview.sent_campaigns),
          totalEmailsSent: parseInt(overview.total_emails_sent),
          totalRecipients: parseInt(overview.total_recipients)
        },
        engagement: {
          delivered: parseInt(engagement.delivered),
          opened: parseInt(engagement.opened),
          clicked: parseInt(engagement.clicked),
          bounced: parseInt(engagement.bounced),
          deliveryRate: overview.total_emails_sent > 0
            ? ((parseInt(engagement.delivered) / parseInt(overview.total_emails_sent)) * 100).toFixed(2)
            : 0,
          openRate: engagement.delivered > 0
            ? ((parseInt(engagement.opened) / parseInt(engagement.delivered)) * 100).toFixed(2)
            : 0,
          clickRate: engagement.opened > 0
            ? ((parseInt(engagement.clicked) / parseInt(engagement.opened)) * 100).toFixed(2)
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

module.exports = new EmailController();
