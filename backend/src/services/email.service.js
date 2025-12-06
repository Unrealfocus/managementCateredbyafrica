const sgMail = require('@sendgrid/mail');
const { db } = require('../config/database');
const { ValidationError } = require('../utils/errors');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
  /**
   * Send single email
   */
  async sendEmail({ to, subject, html, text, from = null, templateId = null, dynamicData = null }) {
    try {
      const msg = {
        to,
        from: from || process.env.SENDGRID_FROM_EMAIL,
        subject,
        ...(templateId ? {
          templateId,
          dynamicTemplateData: dynamicData || {}
        } : {
          html,
          text: text || html.replace(/<[^>]*>?/gm, '') // Strip HTML for text version
        })
      };

      const result = await sgMail.send(msg);
      return {
        success: true,
        messageId: result[0].headers['x-message-id']
      };
    } catch (error) {
      console.error('SendGrid Error:', error.response?.body || error.message);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmail({ recipients, subject, html, text, from = null, templateId = null, dynamicData = null }) {
    try {
      const messages = recipients.map(recipient => ({
        to: recipient.email,
        from: from || process.env.SENDGRID_FROM_EMAIL,
        subject,
        ...(templateId ? {
          templateId,
          dynamicTemplateData: {
            ...dynamicData,
            name: recipient.name,
            ...recipient.customData
          }
        } : {
          html: this.replacePlaceholders(html, recipient),
          text: text || this.replacePlaceholders(html, recipient).replace(/<[^>]*>?/gm, '')
        })
      }));

      // SendGrid can handle up to 1000 emails per API call
      const batchSize = 1000;
      const results = [];

      for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize);
        const result = await sgMail.send(batch);
        results.push(...result);
      }

      return {
        success: true,
        sent: results.length,
        total: recipients.length
      };
    } catch (error) {
      console.error('SendGrid Bulk Error:', error.response?.body || error.message);
      throw new Error(`Failed to send bulk emails: ${error.message}`);
    }
  }

  /**
   * Send campaign to customer segment
   */
  async sendCampaign(campaignId) {
    try {
      // Get campaign details
      const campaign = await db.one(
        'SELECT * FROM email_campaigns WHERE id = $1',
        [campaignId]
      );

      if (campaign.status === 'sent') {
        throw new ValidationError('Campaign has already been sent');
      }

      // Get recipients based on segment
      let recipients = [];

      if (campaign.segment === 'all') {
        recipients = await db.any('SELECT id, email, name FROM customers WHERE is_active = true');
      } else if (campaign.segment === 'with_orders') {
        recipients = await db.any(`
          SELECT DISTINCT c.id, c.email, c.name
          FROM customers c
          INNER JOIN orders o ON o.customer_id = c.id
          WHERE c.is_active = true
        `);
      } else if (campaign.segment === 'without_orders') {
        recipients = await db.any(`
          SELECT c.id, c.email, c.name
          FROM customers c
          LEFT JOIN orders o ON o.customer_id = c.id
          WHERE c.is_active = true AND o.id IS NULL
        `);
      } else if (campaign.segment === 'custom' && campaign.customer_ids) {
        recipients = await db.any(
          'SELECT id, email, name FROM customers WHERE id = ANY($1) AND is_active = true',
          [campaign.customer_ids]
        );
      }

      if (recipients.length === 0) {
        throw new ValidationError('No recipients found for this campaign');
      }

      // Update campaign status
      await db.none(
        'UPDATE email_campaigns SET status = $1, started_at = NOW() WHERE id = $2',
        ['sending', campaignId]
      );

      // Send emails
      const result = await this.sendBulkEmail({
        recipients,
        subject: campaign.subject,
        html: campaign.html_content,
        text: campaign.text_content,
        templateId: campaign.template_id
      });

      // Update campaign status and stats
      await db.none(`
        UPDATE email_campaigns
        SET status = $1, sent_at = NOW(), sent_count = $2, total_recipients = $3
        WHERE id = $4
      `, ['sent', result.sent, recipients.length, campaignId]);

      // Log individual sends
      const logEntries = recipients.map(r => ({
        campaign_id: campaignId,
        customer_id: r.id,
        status: 'sent',
        sent_at: new Date()
      }));

      // Batch insert logs
      const cs = new db.$config.pgp.helpers.ColumnSet(
        ['campaign_id', 'customer_id', 'status', 'sent_at'],
        { table: 'email_logs' }
      );
      const query = db.$config.pgp.helpers.insert(logEntries, cs);
      await db.none(query);

      return {
        success: true,
        campaignId,
        sent: result.sent,
        total: recipients.length
      };

    } catch (error) {
      // Update campaign status to failed
      await db.none(
        'UPDATE email_campaigns SET status = $1 WHERE id = $2',
        ['failed', campaignId]
      );
      throw error;
    }
  }

  /**
   * Replace placeholders in email content
   */
  replacePlaceholders(content, recipient) {
    let replaced = content;
    replaced = replaced.replace(/\{\{name\}\}/g, recipient.name || 'Customer');
    replaced = replaced.replace(/\{\{email\}\}/g, recipient.email || '');
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
   * Validate email template
   */
  validateTemplate(html) {
    const requiredElements = ['unsubscribe', 'company_name'];
    const warnings = [];

    requiredElements.forEach(element => {
      if (!html.includes(`{{${element}}}`) && !html.includes(element)) {
        warnings.push(`Missing recommended element: ${element}`);
      }
    });

    return {
      valid: true,
      warnings
    };
  }

  /**
   * Get email statistics
   */
  async getEmailStats(campaignId) {
    const stats = await db.one(`
      SELECT
        COUNT(*) as total_sent,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
        COUNT(CASE WHEN status = 'opened' THEN 1 END) as opened,
        COUNT(CASE WHEN status = 'clicked' THEN 1 END) as clicked,
        COUNT(CASE WHEN status = 'bounced' THEN 1 END) as bounced,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
      FROM email_logs
      WHERE campaign_id = $1
    `, [campaignId]);

    return {
      totalSent: parseInt(stats.total_sent),
      delivered: parseInt(stats.delivered),
      opened: parseInt(stats.opened),
      clicked: parseInt(stats.clicked),
      bounced: parseInt(stats.bounced),
      failed: parseInt(stats.failed),
      openRate: stats.total_sent > 0 ? (parseInt(stats.opened) / parseInt(stats.total_sent) * 100).toFixed(2) : 0,
      clickRate: stats.total_sent > 0 ? (parseInt(stats.clicked) / parseInt(stats.total_sent) * 100).toFixed(2) : 0
    };
  }
}

module.exports = new EmailService();
