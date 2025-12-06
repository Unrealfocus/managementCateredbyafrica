const { db } = require('../config/database');
const { cacheHelper } = require('../config/redis');
const { successResponse } = require('../utils/response');
const { NotFoundError, ValidationError, ConflictError } = require('../utils/errors');

class CustomerController {
  /**
   * Get all customers with pagination and filters
   */
  async getAllCustomers(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        filter = 'all',
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = req.query;

      const offset = (page - 1) * limit;

      // Build where clause
      let whereClause = 'WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      // Search filter
      if (search) {
        whereClause += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      // Order filter
      if (filter === 'with_orders') {
        whereClause += ' AND total_orders > 0';
      } else if (filter === 'without_orders') {
        whereClause += ' AND total_orders = 0';
      }

      // Validate sort column to prevent SQL injection
      const allowedSortColumns = ['created_at', 'name', 'total_revenue', 'total_orders'];
      const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
      const sortDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

      // Get total count
      const countQuery = `SELECT COUNT(*) FROM customers ${whereClause}`;
      const { count } = await db.one(countQuery, params);

      // Get customers
      params.push(limit, offset);
      const query = `
        SELECT
          id, name, email, phone, avatar_url,
          total_orders, total_revenue, last_order_date,
          status, created_at
        FROM customers
        ${whereClause}
        ORDER BY ${sortColumn} ${sortDirection}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const customers = await db.any(query, params);

      // Get stats
      const stats = await db.one(`
        SELECT
          COUNT(*) as total_customers,
          COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE) as new_today,
          COUNT(*) FILTER (WHERE total_orders > 0) as with_orders,
          COUNT(*) FILTER (WHERE total_orders = 0) as without_orders
        FROM customers
      `);

      return successResponse(res, {
        customers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(count),
          totalPages: Math.ceil(count / limit)
        },
        stats: {
          totalCustomers: parseInt(stats.total_customers),
          newToday: parseInt(stats.new_today),
          withOrders: parseInt(stats.with_orders),
          withoutOrders: parseInt(stats.without_orders)
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(req, res, next) {
    try {
      const { customerId } = req.params;

      // Check cache first
      const cacheKey = `customer:${customerId}`;
      const cached = await cacheHelper.get(cacheKey);

      if (cached) {
        return successResponse(res, cached);
      }

      // Get customer
      const customer = await db.oneOrNone(`
        SELECT
          id, name, email, phone, avatar_url,
          total_orders, total_revenue, last_order_date,
          status, tags, notes, address, city, country,
          created_at, updated_at
        FROM customers
        WHERE id = $1
      `, [customerId]);

      if (!customer) {
        throw new NotFoundError('Customer not found');
      }

      // Get recent orders
      const orders = await db.any(`
        SELECT
          id, order_number, total_amount, status,
          created_at, delivered_at
        FROM orders
        WHERE customer_id = $1
        ORDER BY created_at DESC
        LIMIT 10
      `, [customerId]);

      const result = { ...customer, orders };

      // Cache for 5 minutes
      await cacheHelper.set(cacheKey, result, 300);

      return successResponse(res, result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new customer
   */
  async createCustomer(req, res, next) {
    try {
      const { name, email, phone, address, city, country } = req.body;

      // Validate required fields
      if (!name || !email) {
        throw new ValidationError('Name and email are required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new ValidationError('Invalid email format');
      }

      // Check if email exists
      const existing = await db.oneOrNone(
        'SELECT id FROM customers WHERE email = $1',
        [email]
      );

      if (existing) {
        throw new ConflictError('Email already exists');
      }

      // Generate avatar URL using DiceBear API
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

      // Create customer
      const customer = await db.one(`
        INSERT INTO customers (name, email, phone, avatar_url, address, city, country)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, name, email, phone, avatar_url, total_orders,
                  total_revenue, status, created_at
      `, [name, email, phone || null, avatarUrl, address || null, city || null, country || 'South Africa']);

      return successResponse(res, customer, 'Customer created successfully', 201);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Update customer
   */
  async updateCustomer(req, res, next) {
    try {
      const { customerId } = req.params;
      const updates = req.body;

      // Build update query dynamically
      const allowedFields = ['name', 'phone', 'notes', 'status', 'address', 'city', 'country', 'tags'];
      const fields = [];
      const values = [];
      let paramIndex = 1;

      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          fields.push(`${key} = $${paramIndex}`);
          values.push(updates[key]);
          paramIndex++;
        }
      });

      if (fields.length === 0) {
        throw new ValidationError('No valid fields to update');
      }

      values.push(customerId);

      const query = `
        UPDATE customers
        SET ${fields.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex}
        RETURNING id, name, email, phone, status, updated_at
      `;

      const customer = await db.oneOrNone(query, values);

      if (!customer) {
        throw new NotFoundError('Customer not found');
      }

      // Invalidate cache
      await cacheHelper.del(`customer:${customerId}`);

      return successResponse(res, customer, 'Customer updated successfully');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete customer
   */
  async deleteCustomer(req, res, next) {
    try {
      const { customerId } = req.params;

      const result = await db.result(
        'DELETE FROM customers WHERE id = $1',
        [customerId]
      );

      if (result.rowCount === 0) {
        throw new NotFoundError('Customer not found');
      }

      // Invalidate cache
      await cacheHelper.del(`customer:${customerId}`);

      return successResponse(res, null, 'Customer deleted successfully');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get customer segmentation
   */
  async getSegmentation(req, res, next) {
    try {
      // Cache key for segmentation data
      const cacheKey = 'customers:segmentation';
      const cached = await cacheHelper.get(cacheKey);

      if (cached) {
        return successResponse(res, cached);
      }

      // Get customers with orders
      const withOrders = await db.any(`
        SELECT
          id, name, email, phone, avatar_url,
          total_orders, total_revenue, last_order_date,
          status, created_at
        FROM customers
        WHERE total_orders > 0
        ORDER BY total_revenue DESC
        LIMIT 50
      `);

      // Get customers without orders
      const withoutOrders = await db.any(`
        SELECT
          id, name, email, phone, avatar_url,
          total_orders, total_revenue, status, created_at
        FROM customers
        WHERE total_orders = 0
        ORDER BY created_at DESC
        LIMIT 50
      `);

      // Calculate stats
      const stats = await db.one(`
        SELECT
          COUNT(*) FILTER (WHERE total_orders > 0) as with_orders_count,
          COUNT(*) FILTER (WHERE total_orders = 0) as without_orders_count,
          COALESCE(SUM(total_revenue) FILTER (WHERE total_orders > 0), 0) as total_revenue,
          COALESCE(AVG(total_revenue) FILTER (WHERE total_orders > 0), 0) as avg_order_value
        FROM customers
      `);

      const result = {
        withOrders: {
          count: parseInt(stats.with_orders_count),
          customers: withOrders,
          totalRevenue: parseFloat(stats.total_revenue),
          averageOrderValue: parseFloat(stats.avg_order_value)
        },
        withoutOrders: {
          count: parseInt(stats.without_orders_count),
          customers: withoutOrders
        },
        conversionRate: stats.with_orders_count > 0
          ? ((stats.with_orders_count / (parseInt(stats.with_orders_count) + parseInt(stats.without_orders_count))) * 100).toFixed(2)
          : 0
      };

      // Cache for 5 minutes
      await cacheHelper.set(cacheKey, result, 300);

      return successResponse(res, result);

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CustomerController();
