const { db } = require('../config/database');
const emailService = require('./email.service');
const smsService = require('./sms.service');

class AutomationService {
  /**
   * Execute automation rule
   */
  async executeRule(ruleId, customerId = null) {
    try {
      // Get rule details
      const rule = await db.one(
        'SELECT * FROM automation_rules WHERE id = $1 AND is_active = true',
        [ruleId]
      );

      // Get customers based on trigger
      let customers = [];

      if (customerId) {
        // Execute for specific customer
        customers = await db.any(
          'SELECT * FROM customers WHERE id = $1 AND is_active = true',
          [customerId]
        );
      } else {
        // Execute for all matching customers
        customers = await this.getCustomersByTrigger(rule);
      }

      if (customers.length === 0) {
        return {
          success: true,
          executed: 0,
          message: 'No customers match the automation criteria'
        };
      }

      // Filter customers based on conditions
      const eligibleCustomers = await this.filterCustomersByConditions(
        customers,
        rule.conditions
      );

      if (eligibleCustomers.length === 0) {
        return {
          success: true,
          executed: 0,
          message: 'No customers met the automation conditions'
        };
      }

      // Execute actions
      const results = await this.executeActions(rule, eligibleCustomers);

      // Log automation execution
      await this.logExecution(ruleId, eligibleCustomers, results);

      // Update rule execution stats
      await db.none(`
        UPDATE automation_rules
        SET
          last_executed_at = NOW(),
          total_executions = total_executions + 1,
          total_customers_processed = total_customers_processed + $1
        WHERE id = $2
      `, [eligibleCustomers.length, ruleId]);

      return {
        success: true,
        executed: eligibleCustomers.length,
        results
      };

    } catch (error) {
      console.error('Automation Execution Error:', error.message);
      throw new Error(`Failed to execute automation: ${error.message}`);
    }
  }

  /**
   * Get customers by trigger type
   */
  async getCustomersByTrigger(rule) {
    const { trigger_type, trigger_config } = rule;

    switch (trigger_type) {
      case 'new_customer':
        // Get customers created in the last X hours
        const hours = trigger_config?.hours || 24;
        return await db.any(`
          SELECT * FROM customers
          WHERE created_at >= NOW() - INTERVAL '${hours} hours'
          AND is_active = true
        `);

      case 'first_order':
        // Get customers who just placed their first order
        return await db.any(`
          SELECT DISTINCT c.* FROM customers c
          INNER JOIN orders o ON o.customer_id = c.id
          WHERE c.is_active = true
          AND (
            SELECT COUNT(*) FROM orders
            WHERE customer_id = c.id
            AND status = 'completed'
          ) = 1
          AND o.created_at >= NOW() - INTERVAL '24 hours'
        `);

      case 'abandoned_cart':
        // Get customers with abandoned carts
        const abandonedHours = trigger_config?.hours || 24;
        return await db.any(`
          SELECT c.* FROM customers c
          INNER JOIN carts cart ON cart.customer_id = c.id
          WHERE c.is_active = true
          AND cart.updated_at >= NOW() - INTERVAL '${abandonedHours} hours'
          AND cart.status = 'abandoned'
          AND NOT EXISTS (
            SELECT 1 FROM orders o
            WHERE o.customer_id = c.id
            AND o.created_at > cart.updated_at
          )
        `);

      case 'no_purchase':
        // Get customers who haven't purchased in X days
        const days = trigger_config?.days || 30;
        return await db.any(`
          SELECT c.* FROM customers c
          LEFT JOIN orders o ON o.customer_id = c.id
          WHERE c.is_active = true
          AND (
            o.created_at IS NULL
            OR o.created_at < NOW() - INTERVAL '${days} days'
          )
        `);

      case 'birthday':
        // Get customers with birthday today
        return await db.any(`
          SELECT * FROM customers
          WHERE is_active = true
          AND EXTRACT(MONTH FROM birthday) = EXTRACT(MONTH FROM CURRENT_DATE)
          AND EXTRACT(DAY FROM birthday) = EXTRACT(DAY FROM CURRENT_DATE)
        `);

      case 'order_status_change':
        // Get customers with recent order status changes
        const status = trigger_config?.status || 'completed';
        return await db.any(`
          SELECT DISTINCT c.* FROM customers c
          INNER JOIN orders o ON o.customer_id = c.id
          WHERE c.is_active = true
          AND o.status = $1
          AND o.updated_at >= NOW() - INTERVAL '1 hour'
        `, [status]);

      default:
        return [];
    }
  }

  /**
   * Filter customers by conditions
   */
  async filterCustomersByConditions(customers, conditions) {
    if (!conditions || conditions.length === 0) {
      return customers;
    }

    const eligible = [];

    for (const customer of customers) {
      let meetsConditions = true;

      for (const condition of conditions) {
        const { field, operator, value } = condition;

        // Get field value
        let fieldValue = customer[field];

        // Special handling for related data
        if (field === 'total_orders') {
          const result = await db.one(
            'SELECT COUNT(*) FROM orders WHERE customer_id = $1',
            [customer.id]
          );
          fieldValue = parseInt(result.count);
        } else if (field === 'total_spent') {
          const result = await db.one(
            'SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE customer_id = $1 AND status = $2',
            [customer.id, 'completed']
          );
          fieldValue = parseFloat(result.coalesce);
        } else if (field === 'last_order_date') {
          const result = await db.oneOrNone(
            'SELECT MAX(created_at) FROM orders WHERE customer_id = $1',
            [customer.id]
          );
          fieldValue = result?.max;
        }

        // Evaluate condition
        if (!this.evaluateCondition(fieldValue, operator, value)) {
          meetsConditions = false;
          break;
        }
      }

      if (meetsConditions) {
        eligible.push(customer);
      }
    }

    return eligible;
  }

  /**
   * Evaluate a single condition
   */
  evaluateCondition(fieldValue, operator, value) {
    switch (operator) {
      case 'equals':
        return fieldValue == value;
      case 'not_equals':
        return fieldValue != value;
      case 'greater_than':
        return parseFloat(fieldValue) > parseFloat(value);
      case 'less_than':
        return parseFloat(fieldValue) < parseFloat(value);
      case 'greater_than_or_equal':
        return parseFloat(fieldValue) >= parseFloat(value);
      case 'less_than_or_equal':
        return parseFloat(fieldValue) <= parseFloat(value);
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
      case 'not_contains':
        return !String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
      case 'starts_with':
        return String(fieldValue).toLowerCase().startsWith(String(value).toLowerCase());
      case 'ends_with':
        return String(fieldValue).toLowerCase().endsWith(String(value).toLowerCase());
      case 'is_null':
        return fieldValue === null || fieldValue === undefined;
      case 'is_not_null':
        return fieldValue !== null && fieldValue !== undefined;
      default:
        return false;
    }
  }

  /**
   * Execute actions
   */
  async executeActions(rule, customers) {
    const { actions } = rule;
    const results = {
      emails: { sent: 0, failed: 0 },
      sms: { sent: 0, failed: 0 },
      whatsapp: { sent: 0, failed: 0 }
    };

    for (const action of actions) {
      const { action_type, config } = action;

      try {
        switch (action_type) {
          case 'send_email':
            await this.sendEmailAction(customers, config);
            results.emails.sent += customers.length;
            break;

          case 'send_sms':
            await this.sendSMSAction(customers, config);
            results.sms.sent += customers.length;
            break;

          case 'send_whatsapp':
            await this.sendWhatsAppAction(customers, config);
            results.whatsapp.sent += customers.length;
            break;

          case 'add_tag':
            await this.addTagAction(customers, config);
            break;

          case 'update_segment':
            await this.updateSegmentAction(customers, config);
            break;

          default:
            console.warn(`Unknown action type: ${action_type}`);
        }
      } catch (error) {
        console.error(`Error executing ${action_type}:`, error.message);
        if (action_type === 'send_email') results.emails.failed += customers.length;
        if (action_type === 'send_sms') results.sms.failed += customers.length;
        if (action_type === 'send_whatsapp') results.whatsapp.failed += customers.length;
      }
    }

    return results;
  }

  /**
   * Send email action
   */
  async sendEmailAction(customers, config) {
    const { subject, html_content, template_id } = config;

    const recipients = customers.map(c => ({
      email: c.email,
      name: c.name,
      customData: {
        customer_id: c.id,
        ...c
      }
    }));

    await emailService.sendBulkEmail({
      recipients,
      subject,
      html: html_content,
      templateId: template_id
    });
  }

  /**
   * Send SMS action
   */
  async sendSMSAction(customers, config) {
    const { message } = config;

    const recipients = customers
      .filter(c => c.phone)
      .map(c => ({
        phone: c.phone,
        name: c.name,
        customData: {
          customer_id: c.id,
          ...c
        }
      }));

    await smsService.sendBulkSMS({
      recipients,
      message
    });
  }

  /**
   * Send WhatsApp action
   */
  async sendWhatsAppAction(customers, config) {
    const { message, media_url } = config;

    const recipients = customers
      .filter(c => c.phone)
      .map(c => ({
        phone: c.phone,
        name: c.name,
        customData: {
          customer_id: c.id,
          ...c
        }
      }));

    await smsService.sendBulkWhatsApp({
      recipients,
      message,
      mediaUrl: media_url
    });
  }

  /**
   * Add tag action
   */
  async addTagAction(customers, config) {
    const { tag } = config;

    for (const customer of customers) {
      await db.none(`
        INSERT INTO customer_tags (customer_id, tag)
        VALUES ($1, $2)
        ON CONFLICT (customer_id, tag) DO NOTHING
      `, [customer.id, tag]);
    }
  }

  /**
   * Update segment action
   */
  async updateSegmentAction(customers, config) {
    const { segment } = config;

    const customerIds = customers.map(c => c.id);

    await db.none(`
      UPDATE customers
      SET segment = $1
      WHERE id = ANY($2)
    `, [segment, customerIds]);
  }

  /**
   * Log automation execution
   */
  async logExecution(ruleId, customers, results) {
    const logEntries = customers.map(c => ({
      automation_rule_id: ruleId,
      customer_id: c.id,
      executed_at: new Date(),
      results: JSON.stringify(results)
    }));

    const cs = new db.$config.pgp.helpers.ColumnSet(
      ['automation_rule_id', 'customer_id', 'executed_at', 'results'],
      { table: 'automation_logs' }
    );

    const query = db.$config.pgp.helpers.insert(logEntries, cs);
    await db.none(query);
  }

  /**
   * Check and execute scheduled automations
   */
  async checkScheduledAutomations() {
    try {
      // Get all active rules with schedule
      const rules = await db.any(`
        SELECT * FROM automation_rules
        WHERE is_active = true
        AND schedule_type IS NOT NULL
      `);

      for (const rule of rules) {
        if (this.shouldExecuteNow(rule)) {
          await this.executeRule(rule.id);
        }
      }
    } catch (error) {
      console.error('Scheduled Automation Check Error:', error.message);
    }
  }

  /**
   * Check if rule should execute now
   */
  shouldExecuteNow(rule) {
    const { schedule_type, schedule_config, last_executed_at } = rule;

    const now = new Date();
    const lastExecuted = last_executed_at ? new Date(last_executed_at) : null;

    switch (schedule_type) {
      case 'immediate':
        return true;

      case 'hourly':
        if (!lastExecuted) return true;
        const hoursSince = (now - lastExecuted) / (1000 * 60 * 60);
        return hoursSince >= 1;

      case 'daily':
        if (!lastExecuted) return true;
        const scheduledHour = schedule_config?.hour || 9;
        return now.getHours() === scheduledHour &&
               (!lastExecuted || now.toDateString() !== lastExecuted.toDateString());

      case 'weekly':
        if (!lastExecuted) return true;
        const scheduledDay = schedule_config?.day || 1; // Monday
        const scheduledHourWeekly = schedule_config?.hour || 9;
        return now.getDay() === scheduledDay &&
               now.getHours() === scheduledHourWeekly &&
               (!lastExecuted || now.toDateString() !== lastExecuted.toDateString());

      case 'monthly':
        if (!lastExecuted) return true;
        const scheduledDate = schedule_config?.date || 1;
        const scheduledHourMonthly = schedule_config?.hour || 9;
        return now.getDate() === scheduledDate &&
               now.getHours() === scheduledHourMonthly &&
               (!lastExecuted || now.toDateString() !== lastExecuted.toDateString());

      default:
        return false;
    }
  }

  /**
   * Get automation statistics
   */
  async getAutomationStats(ruleId) {
    const stats = await db.one(`
      SELECT
        COUNT(*) as total_executions,
        COUNT(DISTINCT customer_id) as unique_customers,
        MIN(executed_at) as first_execution,
        MAX(executed_at) as last_execution
      FROM automation_logs
      WHERE automation_rule_id = $1
    `, [ruleId]);

    return {
      totalExecutions: parseInt(stats.total_executions),
      uniqueCustomers: parseInt(stats.unique_customers),
      firstExecution: stats.first_execution,
      lastExecution: stats.last_execution
    };
  }
}

module.exports = new AutomationService();
