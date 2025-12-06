const { db } = require('../config/database');
const { successResponse } = require('../utils/response');
const { ValidationError, NotFoundError } = require('../utils/errors');
const automationService = require('../services/automation.service');

class AutomationController {
  /**
   * Get all automation rules
   */
  async getAllRules(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        isActive,
        triggerType,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = req.query;

      const offset = (page - 1) * limit;

      // Build filter
      const filters = [];
      const params = [];
      let paramCount = 1;

      if (isActive !== undefined) {
        filters.push(`is_active = $${paramCount++}`);
        params.push(isActive === 'true');
      }

      if (triggerType) {
        filters.push(`trigger_type = $${paramCount++}`);
        params.push(triggerType);
      }

      const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

      // Allowed sort columns
      const allowedSort = ['created_at', 'name', 'last_executed_at', 'total_executions'];
      const sortColumn = allowedSort.includes(sortBy) ? sortBy : 'created_at';
      const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

      // Get rules
      params.push(limit, offset);
      const rules = await db.any(`
        SELECT
          id,
          name,
          description,
          trigger_type,
          schedule_type,
          is_active,
          total_executions,
          total_customers_processed,
          last_executed_at,
          created_at
        FROM automation_rules
        ${whereClause}
        ORDER BY ${sortColumn} ${order}
        LIMIT $${paramCount++} OFFSET $${paramCount++}
      `, params);

      // Get total count
      const { count } = await db.one(`
        SELECT COUNT(*) FROM automation_rules ${whereClause}
      `, params.slice(0, -2)); // Remove limit and offset params

      return successResponse(res, {
        rules,
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
   * Get rule by ID
   */
  async getRuleById(req, res, next) {
    try {
      const { id } = req.params;

      const rule = await db.oneOrNone(
        'SELECT * FROM automation_rules WHERE id = $1',
        [id]
      );

      if (!rule) {
        throw new NotFoundError('Automation rule not found');
      }

      // Get rule stats
      const stats = await automationService.getAutomationStats(id);

      return successResponse(res, {
        rule,
        stats
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new automation rule
   */
  async createRule(req, res, next) {
    try {
      const {
        name,
        description,
        triggerType,
        triggerConfig = {},
        conditions = [],
        actions = [],
        scheduleType = 'immediate',
        scheduleConfig = {},
        isActive = true
      } = req.body;

      // Validate required fields
      if (!name || !triggerType || !actions || actions.length === 0) {
        throw new ValidationError('Name, trigger type, and at least one action are required');
      }

      // Validate trigger type
      const validTriggers = [
        'new_customer',
        'first_order',
        'abandoned_cart',
        'no_purchase',
        'birthday',
        'order_status_change'
      ];
      if (!validTriggers.includes(triggerType)) {
        throw new ValidationError(`Invalid trigger type. Must be one of: ${validTriggers.join(', ')}`);
      }

      // Validate schedule type
      const validSchedules = ['immediate', 'hourly', 'daily', 'weekly', 'monthly'];
      if (scheduleType && !validSchedules.includes(scheduleType)) {
        throw new ValidationError(`Invalid schedule type. Must be one of: ${validSchedules.join(', ')}`);
      }

      // Validate actions
      const validActions = [
        'send_email',
        'send_sms',
        'send_whatsapp',
        'add_tag',
        'update_segment'
      ];
      for (const action of actions) {
        if (!validActions.includes(action.action_type)) {
          throw new ValidationError(`Invalid action type: ${action.action_type}`);
        }
      }

      // Create rule
      const rule = await db.one(`
        INSERT INTO automation_rules (
          name,
          description,
          trigger_type,
          trigger_config,
          conditions,
          actions,
          schedule_type,
          schedule_config,
          is_active,
          total_executions,
          total_customers_processed
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, 0)
        RETURNING *
      `, [
        name,
        description,
        triggerType,
        JSON.stringify(triggerConfig),
        JSON.stringify(conditions),
        JSON.stringify(actions),
        scheduleType,
        JSON.stringify(scheduleConfig),
        isActive
      ]);

      return successResponse(res, rule, 'Automation rule created successfully', 201);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Update automation rule
   */
  async updateRule(req, res, next) {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        triggerType,
        triggerConfig,
        conditions,
        actions,
        scheduleType,
        scheduleConfig,
        isActive
      } = req.body;

      // Check if rule exists
      const existing = await db.oneOrNone(
        'SELECT id FROM automation_rules WHERE id = $1',
        [id]
      );

      if (!existing) {
        throw new NotFoundError('Automation rule not found');
      }

      // Build update query dynamically
      const updates = [];
      const params = [];
      let paramCount = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramCount++}`);
        params.push(name);
      }
      if (description !== undefined) {
        updates.push(`description = $${paramCount++}`);
        params.push(description);
      }
      if (triggerType !== undefined) {
        updates.push(`trigger_type = $${paramCount++}`);
        params.push(triggerType);
      }
      if (triggerConfig !== undefined) {
        updates.push(`trigger_config = $${paramCount++}`);
        params.push(JSON.stringify(triggerConfig));
      }
      if (conditions !== undefined) {
        updates.push(`conditions = $${paramCount++}`);
        params.push(JSON.stringify(conditions));
      }
      if (actions !== undefined) {
        updates.push(`actions = $${paramCount++}`);
        params.push(JSON.stringify(actions));
      }
      if (scheduleType !== undefined) {
        updates.push(`schedule_type = $${paramCount++}`);
        params.push(scheduleType);
      }
      if (scheduleConfig !== undefined) {
        updates.push(`schedule_config = $${paramCount++}`);
        params.push(JSON.stringify(scheduleConfig));
      }
      if (isActive !== undefined) {
        updates.push(`is_active = $${paramCount++}`);
        params.push(isActive);
      }

      if (updates.length === 0) {
        throw new ValidationError('No fields to update');
      }

      updates.push(`updated_at = NOW()`);
      params.push(id);

      const rule = await db.one(`
        UPDATE automation_rules
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `, params);

      return successResponse(res, rule, 'Automation rule updated successfully');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete automation rule
   */
  async deleteRule(req, res, next) {
    try {
      const { id } = req.params;

      // Check if rule exists
      const existing = await db.oneOrNone(
        'SELECT id FROM automation_rules WHERE id = $1',
        [id]
      );

      if (!existing) {
        throw new NotFoundError('Automation rule not found');
      }

      // Delete rule
      await db.none('DELETE FROM automation_rules WHERE id = $1', [id]);

      return successResponse(res, null, 'Automation rule deleted successfully');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle rule active status
   */
  async toggleRule(req, res, next) {
    try {
      const { id } = req.params;

      const rule = await db.oneOrNone(
        'SELECT is_active FROM automation_rules WHERE id = $1',
        [id]
      );

      if (!rule) {
        throw new NotFoundError('Automation rule not found');
      }

      const updated = await db.one(
        'UPDATE automation_rules SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [!rule.is_active, id]
      );

      return successResponse(
        res,
        updated,
        `Automation rule ${updated.is_active ? 'activated' : 'deactivated'} successfully`
      );

    } catch (error) {
      next(error);
    }
  }

  /**
   * Execute rule manually
   */
  async executeRule(req, res, next) {
    try {
      const { id } = req.params;
      const { customerId } = req.body;

      // Check if rule exists
      const rule = await db.oneOrNone(
        'SELECT id, is_active FROM automation_rules WHERE id = $1',
        [id]
      );

      if (!rule) {
        throw new NotFoundError('Automation rule not found');
      }

      if (!rule.is_active) {
        throw new ValidationError('Cannot execute inactive automation rule');
      }

      // Execute rule
      const result = await automationService.executeRule(id, customerId);

      return successResponse(res, result, 'Automation rule executed successfully');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get execution logs
   */
  async getExecutionLogs(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const offset = (page - 1) * limit;

      // Check if rule exists
      const rule = await db.oneOrNone(
        'SELECT id FROM automation_rules WHERE id = $1',
        [id]
      );

      if (!rule) {
        throw new NotFoundError('Automation rule not found');
      }

      // Get logs
      const logs = await db.any(`
        SELECT
          al.id,
          al.customer_id,
          al.executed_at,
          al.results,
          c.name as customer_name,
          c.email as customer_email
        FROM automation_logs al
        LEFT JOIN customers c ON c.id = al.customer_id
        WHERE al.automation_rule_id = $1
        ORDER BY al.executed_at DESC
        LIMIT $2 OFFSET $3
      `, [id, limit, offset]);

      // Get total count
      const { count } = await db.one(
        'SELECT COUNT(*) FROM automation_logs WHERE automation_rule_id = $1',
        [id]
      );

      return successResponse(res, {
        logs,
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
   * Get automation analytics
   */
  async getAnalytics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      // Build date filter
      let dateFilter = '';
      const params = [];
      if (startDate && endDate) {
        dateFilter = 'WHERE created_at BETWEEN $1 AND $2';
        params.push(startDate, endDate);
      }

      // Get overview stats
      const overview = await db.one(`
        SELECT
          COUNT(*) as total_rules,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_rules,
          COALESCE(SUM(total_executions), 0) as total_executions,
          COALESCE(SUM(total_customers_processed), 0) as total_customers_processed
        FROM automation_rules
        ${dateFilter}
      `, params);

      // Get execution trends
      const executionTrends = await db.any(`
        SELECT
          DATE(executed_at) as date,
          COUNT(*) as executions,
          COUNT(DISTINCT customer_id) as unique_customers
        FROM automation_logs
        ${dateFilter ? 'WHERE executed_at BETWEEN $1 AND $2' : ''}
        GROUP BY DATE(executed_at)
        ORDER BY date DESC
        LIMIT 30
      `, params);

      // Get top performing rules
      const topRules = await db.any(`
        SELECT
          id,
          name,
          trigger_type,
          total_executions,
          total_customers_processed
        FROM automation_rules
        WHERE total_executions > 0
        ORDER BY total_executions DESC
        LIMIT 10
      `);

      return successResponse(res, {
        overview: {
          totalRules: parseInt(overview.total_rules),
          activeRules: parseInt(overview.active_rules),
          totalExecutions: parseInt(overview.total_executions),
          totalCustomersProcessed: parseInt(overview.total_customers_processed)
        },
        executionTrends,
        topRules
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Test rule conditions
   */
  async testRule(req, res, next) {
    try {
      const { customerId, conditions } = req.body;

      if (!customerId || !conditions) {
        throw new ValidationError('Customer ID and conditions are required');
      }

      // Get customer
      const customer = await db.oneOrNone(
        'SELECT * FROM customers WHERE id = $1',
        [customerId]
      );

      if (!customer) {
        throw new NotFoundError('Customer not found');
      }

      // Test conditions
      const eligible = await automationService.filterCustomersByConditions(
        [customer],
        conditions
      );

      return successResponse(res, {
        customerId,
        customerName: customer.name,
        meetsConditions: eligible.length > 0,
        conditionsCount: conditions.length
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AutomationController();
