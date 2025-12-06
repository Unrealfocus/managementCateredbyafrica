const { db } = require('../config/database');
const { cacheHelper } = require('../config/redis');
const { successResponse } = require('../utils/response');
const { ValidationError, NotFoundError } = require('../utils/errors');

class OrderController {
  /**
   * Get all orders
   */
  async getAllOrders(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        orderType,
        customerId,
        startDate,
        endDate,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = req.query;

      const offset = (page - 1) * limit;

      // Build filter
      const filters = [];
      const params = [];
      let paramCount = 1;

      if (status) {
        filters.push(`o.status = $${paramCount++}`);
        params.push(status);
      }

      if (orderType) {
        filters.push(`o.order_type = $${paramCount++}`);
        params.push(orderType);
      }

      if (customerId) {
        filters.push(`o.customer_id = $${paramCount++}`);
        params.push(customerId);
      }

      if (startDate && endDate) {
        filters.push(`o.created_at BETWEEN $${paramCount++} AND $${paramCount++}`);
        params.push(startDate, endDate);
      }

      const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

      // Allowed sort columns
      const allowedSort = ['created_at', 'total_amount', 'order_number'];
      const sortColumn = allowedSort.includes(sortBy) ? sortBy : 'created_at';
      const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

      // Get orders
      params.push(limit, offset);
      const orders = await db.any(`
        SELECT
          o.id,
          o.order_number,
          o.customer_id,
          o.order_type,
          o.status,
          o.total_amount,
          o.items,
          o.created_at,
          o.updated_at,
          c.name as customer_name,
          c.email as customer_email
        FROM orders o
        LEFT JOIN customers c ON c.id = o.customer_id
        ${whereClause}
        ORDER BY o.${sortColumn} ${order}
        LIMIT $${paramCount++} OFFSET $${paramCount++}
      `, params);

      // Get total count
      const { count } = await db.one(`
        SELECT COUNT(*) FROM orders o ${whereClause}
      `, params.slice(0, -2)); // Remove limit and offset params

      // Get stats
      const stats = await db.one(`
        SELECT
          COALESCE(SUM(total_amount), 0) as total_revenue,
          COALESCE(AVG(total_amount), 0) as avg_order_value
        FROM orders o
        ${whereClause}
      `, params.slice(0, -2));

      return successResponse(res, {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(count),
          pages: Math.ceil(count / limit)
        },
        stats: {
          totalRevenue: parseFloat(stats.total_revenue),
          avgOrderValue: parseFloat(stats.avg_order_value)
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(req, res, next) {
    try {
      const { id } = req.params;

      const cacheKey = `order:${id}`;

      // Check cache
      const cached = await cacheHelper.get(cacheKey);
      if (cached) {
        return successResponse(res, cached);
      }

      const order = await db.oneOrNone(`
        SELECT
          o.*,
          c.name as customer_name,
          c.email as customer_email,
          c.phone as customer_phone,
          c.address as customer_address
        FROM orders o
        LEFT JOIN customers c ON c.id = o.customer_id
        WHERE o.id = $1
      `, [id]);

      if (!order) {
        throw new NotFoundError('Order not found');
      }

      // Get order items if stored separately
      const items = await db.any(
        'SELECT * FROM order_items WHERE order_id = $1',
        [id]
      );

      const result = {
        ...order,
        order_items: items
      };

      // Cache for 5 minutes
      await cacheHelper.set(cacheKey, result, 300);

      return successResponse(res, result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new order
   */
  async createOrder(req, res, next) {
    try {
      const {
        customerId,
        orderType = 'online',
        items,
        shippingAddress,
        billingAddress,
        paymentMethod,
        notes
      } = req.body;

      // Validate required fields
      if (!customerId || !items || items.length === 0) {
        throw new ValidationError('Customer ID and items are required');
      }

      // Validate customer exists
      const customer = await db.oneOrNone(
        'SELECT id FROM customers WHERE id = $1 AND is_active = true',
        [customerId]
      );

      if (!customer) {
        throw new NotFoundError('Customer not found');
      }

      // Calculate totals
      let subtotal = 0;
      const processedItems = [];

      for (const item of items) {
        // Get product details
        const product = await db.oneOrNone(
          'SELECT id, name, price, stock_quantity FROM products WHERE id = $1',
          [item.productId]
        );

        if (!product) {
          throw new NotFoundError(`Product with ID ${item.productId} not found`);
        }

        // Check stock
        if (product.stock_quantity < item.quantity) {
          throw new ValidationError(`Insufficient stock for product: ${product.name}`);
        }

        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;

        processedItems.push({
          product_id: product.id,
          product_name: product.name,
          quantity: item.quantity,
          unit_price: product.price,
          total_price: itemTotal
        });
      }

      // Calculate tax and total
      const taxRate = 0.1; // 10% tax
      const tax = subtotal * taxRate;
      const totalAmount = subtotal + tax;

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create order
      const order = await db.one(`
        INSERT INTO orders (
          order_number,
          customer_id,
          order_type,
          status,
          subtotal,
          tax,
          total_amount,
          items,
          shipping_address,
          billing_address,
          payment_method,
          notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
        orderNumber,
        customerId,
        orderType,
        'pending',
        subtotal,
        tax,
        totalAmount,
        JSON.stringify(processedItems),
        JSON.stringify(shippingAddress),
        JSON.stringify(billingAddress),
        paymentMethod,
        notes
      ]);

      // Insert order items
      for (const item of processedItems) {
        await db.none(`
          INSERT INTO order_items (
            order_id,
            product_id,
            product_name,
            quantity,
            unit_price,
            total_price
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          order.id,
          item.product_id,
          item.product_name,
          item.quantity,
          item.unit_price,
          item.total_price
        ]);

        // Update product stock
        await db.none(
          'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      // Emit Socket.IO event for real-time updates
      const io = req.app.get('io');
      if (io) {
        io.emit('order:created', order);
      }

      return successResponse(res, order, 'Order created successfully', 201);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Update order
   */
  async updateOrder(req, res, next) {
    try {
      const { id } = req.params;
      const {
        status,
        shippingAddress,
        billingAddress,
        paymentMethod,
        notes,
        trackingNumber
      } = req.body;

      // Check if order exists
      const existing = await db.oneOrNone(
        'SELECT * FROM orders WHERE id = $1',
        [id]
      );

      if (!existing) {
        throw new NotFoundError('Order not found');
      }

      // Build update query dynamically
      const updates = [];
      const params = [];
      let paramCount = 1;

      if (status !== undefined) {
        updates.push(`status = $${paramCount++}`);
        params.push(status);
      }
      if (shippingAddress !== undefined) {
        updates.push(`shipping_address = $${paramCount++}`);
        params.push(JSON.stringify(shippingAddress));
      }
      if (billingAddress !== undefined) {
        updates.push(`billing_address = $${paramCount++}`);
        params.push(JSON.stringify(billingAddress));
      }
      if (paymentMethod !== undefined) {
        updates.push(`payment_method = $${paramCount++}`);
        params.push(paymentMethod);
      }
      if (notes !== undefined) {
        updates.push(`notes = $${paramCount++}`);
        params.push(notes);
      }
      if (trackingNumber !== undefined) {
        updates.push(`tracking_number = $${paramCount++}`);
        params.push(trackingNumber);
      }

      if (updates.length === 0) {
        throw new ValidationError('No fields to update');
      }

      updates.push(`updated_at = NOW()`);
      params.push(id);

      const order = await db.one(`
        UPDATE orders
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `, params);

      // Invalidate cache
      await cacheHelper.del(`order:${id}`);

      // Emit Socket.IO event
      const io = req.app.get('io');
      if (io) {
        io.emit('order:updated', order);
      }

      return successResponse(res, order, 'Order updated successfully');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        throw new ValidationError('Status is required');
      }

      // Validate status
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      // Check if order exists
      const existing = await db.oneOrNone(
        'SELECT * FROM orders WHERE id = $1',
        [id]
      );

      if (!existing) {
        throw new NotFoundError('Order not found');
      }

      // Update status
      const order = await db.one(
        'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [status, id]
      );

      // If order is cancelled, restore product stock
      if (status === 'cancelled' && existing.status !== 'cancelled') {
        const items = await db.any(
          'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
          [id]
        );

        for (const item of items) {
          await db.none(
            'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
            [item.quantity, item.product_id]
          );
        }
      }

      // Invalidate cache
      await cacheHelper.del(`order:${id}`);

      // Emit Socket.IO event
      const io = req.app.get('io');
      if (io) {
        io.emit('order:status_updated', { orderId: id, status });
      }

      return successResponse(res, order, 'Order status updated successfully');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete order
   */
  async deleteOrder(req, res, next) {
    try {
      const { id } = req.params;

      // Check if order exists
      const existing = await db.oneOrNone(
        'SELECT status FROM orders WHERE id = $1',
        [id]
      );

      if (!existing) {
        throw new NotFoundError('Order not found');
      }

      // Only allow deletion of pending or cancelled orders
      if (!['pending', 'cancelled'].includes(existing.status)) {
        throw new ValidationError('Only pending or cancelled orders can be deleted');
      }

      // Restore product stock if not cancelled
      if (existing.status === 'pending') {
        const items = await db.any(
          'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
          [id]
        );

        for (const item of items) {
          await db.none(
            'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
            [item.quantity, item.product_id]
          );
        }
      }

      // Delete order (order_items will be cascade deleted)
      await db.none('DELETE FROM orders WHERE id = $1', [id]);

      // Invalidate cache
      await cacheHelper.del(`order:${id}`);

      return successResponse(res, null, 'Order deleted successfully');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order statistics
   */
  async getOrderStats(req, res, next) {
    try {
      const { startDate, endDate, customerId } = req.query;

      // Build filter
      let whereClause = '';
      const params = [];

      if (startDate && endDate) {
        whereClause = 'WHERE created_at BETWEEN $1 AND $2';
        params.push(startDate, endDate);
        if (customerId) {
          whereClause += ' AND customer_id = $3';
          params.push(customerId);
        }
      } else if (customerId) {
        whereClause = 'WHERE customer_id = $1';
        params.push(customerId);
      }

      const stats = await db.one(`
        SELECT
          COUNT(*) as total_orders,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) as total_revenue,
          COALESCE(AVG(CASE WHEN status = 'completed' THEN total_amount END), 0) as avg_order_value
        FROM orders
        ${whereClause}
      `, params);

      return successResponse(res, {
        totalOrders: parseInt(stats.total_orders),
        completedOrders: parseInt(stats.completed_orders),
        pendingOrders: parseInt(stats.pending_orders),
        cancelledOrders: parseInt(stats.cancelled_orders),
        totalRevenue: parseFloat(stats.total_revenue),
        avgOrderValue: parseFloat(stats.avg_order_value)
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
