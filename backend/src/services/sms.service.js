const twilio = require('twilio');
const { db } = require('../config/database');
const { ValidationError } = require('../utils/errors');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

class SMSService {
  /**
   * Send single SMS
   */
  async sendSMS({ to, message, from = null }) {
    try {
      // Validate phone number format
      if (!this.isValidPhoneNumber(to)) {
        throw new ValidationError('Invalid phone number format');
      }

      const result = await twilioClient.messages.create({
        body: message,
        from: from || process.env.TWILIO_PHONE_NUMBER,
        to
      });

      return {
        success: true,
        messageId: result.sid,
        status: result.status
      };
    } catch (error) {
      console.error('Twilio SMS Error:', error.message);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  /**
   * Send WhatsApp message
   */
  async sendWhatsApp({ to, message, mediaUrl = null }) {
    try {
      // Validate phone number format
      if (!this.isValidPhoneNumber(to)) {
        throw new ValidationError('Invalid phone number format');
      }

      const messageData = {
        body: message,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${to}`
      };

      if (mediaUrl) {
        messageData.mediaUrl = [mediaUrl];
      }

      const result = await twilioClient.messages.create(messageData);

      return {
        success: true,
        messageId: result.sid,
        status: result.status
      };
    } catch (error) {
      console.error('Twilio WhatsApp Error:', error.message);
      throw new Error(`Failed to send WhatsApp message: ${error.message}`);
    }
  }

  /**
   * Send bulk SMS
   */
  async sendBulkSMS({ recipients, message, from = null }) {
    try {
      const results = [];
      const errors = [];

      // Twilio recommends sending messages sequentially or in small batches
      // to avoid overwhelming the API
      for (const recipient of recipients) {
        try {
          const personalizedMessage = this.replacePlaceholders(message, recipient);
          const result = await this.sendSMS({
            to: recipient.phone,
            message: personalizedMessage,
            from
          });
          results.push({
            phone: recipient.phone,
            messageId: result.messageId,
            status: 'sent'
          });
        } catch (error) {
          errors.push({
            phone: recipient.phone,
            error: error.message
          });
        }

        // Add a small delay to avoid rate limiting (optional)
        await this.delay(100);
      }

      return {
        success: true,
        sent: results.length,
        failed: errors.length,
        total: recipients.length,
        results,
        errors
      };
    } catch (error) {
      console.error('Bulk SMS Error:', error.message);
      throw new Error(`Failed to send bulk SMS: ${error.message}`);
    }
  }

  /**
   * Send bulk WhatsApp messages
   */
  async sendBulkWhatsApp({ recipients, message, mediaUrl = null }) {
    try {
      const results = [];
      const errors = [];

      for (const recipient of recipients) {
        try {
          const personalizedMessage = this.replacePlaceholders(message, recipient);
          const result = await this.sendWhatsApp({
            to: recipient.phone,
            message: personalizedMessage,
            mediaUrl
          });
          results.push({
            phone: recipient.phone,
            messageId: result.messageId,
            status: 'sent'
          });
        } catch (error) {
          errors.push({
            phone: recipient.phone,
            error: error.message
          });
        }

        // Add delay to avoid rate limiting
        await this.delay(1000); // WhatsApp has stricter rate limits
      }

      return {
        success: true,
        sent: results.length,
        failed: errors.length,
        total: recipients.length,
        results,
        errors
      };
    } catch (error) {
      console.error('Bulk WhatsApp Error:', error.message);
      throw new Error(`Failed to send bulk WhatsApp messages: ${error.message}`);
    }
  }

  /**
   * Send campaign
   */
  async sendCampaign(campaignId) {
    try {
      // Get campaign details
      const campaign = await db.one(
        'SELECT * FROM message_campaigns WHERE id = $1',
        [campaignId]
      );

      if (campaign.status === 'sent') {
        throw new ValidationError('Campaign has already been sent');
      }

      // Get recipients based on segment
      let recipients = [];

      if (campaign.segment === 'all') {
        recipients = await db.any(`
          SELECT id, phone, name
          FROM customers
          WHERE is_active = true AND phone IS NOT NULL AND phone != ''
        `);
      } else if (campaign.segment === 'with_orders') {
        recipients = await db.any(`
          SELECT DISTINCT c.id, c.phone, c.name
          FROM customers c
          INNER JOIN orders o ON o.customer_id = c.id
          WHERE c.is_active = true AND c.phone IS NOT NULL AND c.phone != ''
        `);
      } else if (campaign.segment === 'without_orders') {
        recipients = await db.any(`
          SELECT c.id, c.phone, c.name
          FROM customers c
          LEFT JOIN orders o ON o.customer_id = c.id
          WHERE c.is_active = true AND o.id IS NULL
          AND c.phone IS NOT NULL AND c.phone != ''
        `);
      } else if (campaign.segment === 'custom' && campaign.customer_ids) {
        recipients = await db.any(`
          SELECT id, phone, name
          FROM customers
          WHERE id = ANY($1) AND is_active = true
          AND phone IS NOT NULL AND phone != ''
        `, [campaign.customer_ids]);
      }

      if (recipients.length === 0) {
        throw new ValidationError('No recipients found for this campaign');
      }

      // Update campaign status
      await db.none(
        'UPDATE message_campaigns SET status = $1, started_at = NOW() WHERE id = $2',
        ['sending', campaignId]
      );

      // Send messages based on type
      let result;
      if (campaign.message_type === 'sms') {
        result = await this.sendBulkSMS({
          recipients,
          message: campaign.message_content,
          from: campaign.from_number
        });
      } else if (campaign.message_type === 'whatsapp') {
        result = await this.sendBulkWhatsApp({
          recipients,
          message: campaign.message_content,
          mediaUrl: campaign.media_url
        });
      }

      // Update campaign status and stats
      await db.none(`
        UPDATE message_campaigns
        SET
          status = $1,
          sent_at = NOW(),
          sent_count = $2,
          failed_count = $3,
          total_recipients = $4
        WHERE id = $5
      `, ['sent', result.sent, result.failed, recipients.length, campaignId]);

      // Log individual sends
      const logEntries = result.results.map(r => {
        const recipient = recipients.find(rec => rec.phone === r.phone);
        return {
          campaign_id: campaignId,
          customer_id: recipient?.id,
          phone: r.phone,
          message_id: r.messageId,
          status: 'sent',
          sent_at: new Date()
        };
      });

      // Batch insert logs
      if (logEntries.length > 0) {
        const cs = new db.$config.pgp.helpers.ColumnSet(
          ['campaign_id', 'customer_id', 'phone', 'message_id', 'status', 'sent_at'],
          { table: 'message_logs' }
        );
        const query = db.$config.pgp.helpers.insert(logEntries, cs);
        await db.none(query);
      }

      return {
        success: true,
        campaignId,
        sent: result.sent,
        failed: result.failed,
        total: recipients.length
      };

    } catch (error) {
      // Update campaign status to failed
      await db.none(
        'UPDATE message_campaigns SET status = $1 WHERE id = $2',
        ['failed', campaignId]
      );
      throw error;
    }
  }

  /**
   * Get message status
   */
  async getMessageStatus(messageSid) {
    try {
      const message = await twilioClient.messages(messageSid).fetch();
      return {
        sid: message.sid,
        status: message.status,
        to: message.to,
        from: message.from,
        dateSent: message.dateSent,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage
      };
    } catch (error) {
      console.error('Twilio Status Error:', error.message);
      throw new Error(`Failed to get message status: ${error.message}`);
    }
  }

  /**
   * Get campaign statistics
   */
  async getCampaignStats(campaignId) {
    const stats = await db.one(`
      SELECT
        COUNT(*) as total_sent,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN status = 'undelivered' THEN 1 END) as undelivered
      FROM message_logs
      WHERE campaign_id = $1
    `, [campaignId]);

    return {
      totalSent: parseInt(stats.total_sent),
      delivered: parseInt(stats.delivered),
      failed: parseInt(stats.failed),
      undelivered: parseInt(stats.undelivered),
      deliveryRate: stats.total_sent > 0
        ? ((parseInt(stats.delivered) / parseInt(stats.total_sent)) * 100).toFixed(2)
        : 0
    };
  }

  /**
   * Replace placeholders in message content
   */
  replacePlaceholders(content, recipient) {
    let replaced = content;
    replaced = replaced.replace(/\{\{name\}\}/g, recipient.name || 'Customer');
    replaced = replaced.replace(/\{\{phone\}\}/g, recipient.phone || '');
    replaced = replaced.replace(/\{\{first_name\}\}/g, (recipient.name || '').split(' ')[0] || 'Customer');

    // Add custom data replacements
    if (recipient.customData) {
      Object.keys(recipient.customData).forEach(key => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        replaced = replaced.replace(regex, recipient.customData[key]);
      });
    }

    return replaced;
  }

  /**
   * Validate phone number format
   */
  isValidPhoneNumber(phone) {
    // E.164 format: +[country code][number]
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Delay helper function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate message template
   */
  validateTemplate(message, type = 'sms') {
    const warnings = [];

    // SMS character limit
    if (type === 'sms' && message.length > 1600) {
      warnings.push('SMS message exceeds recommended length of 1600 characters');
    }

    // WhatsApp character limit
    if (type === 'whatsapp' && message.length > 4096) {
      warnings.push('WhatsApp message exceeds maximum length of 4096 characters');
    }

    // Check for common placeholders
    const commonPlaceholders = ['{{name}}', '{{first_name}}'];
    const hasPlaceholder = commonPlaceholders.some(p => message.includes(p));
    if (!hasPlaceholder) {
      warnings.push('Consider adding personalization placeholders like {{name}} or {{first_name}}');
    }

    return {
      valid: true,
      warnings,
      estimatedSegments: type === 'sms' ? Math.ceil(message.length / 160) : 1
    };
  }
}

module.exports = new SMSService();
