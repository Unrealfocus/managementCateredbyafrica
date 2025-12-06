const { db } = require('../config/database');
const { cacheHelper } = require('../config/redis');
const { successResponse } = require('../utils/response');

class DashboardController {
  /**
   * Get dashboard metrics
   */
  async getMetrics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      // Cache key
      const cacheKey = `dashboard:metrics:${startDate || 'all'}:${endDate || 'all'}`;

      // Check cache
      const cached = await cacheHelper.get(cacheKey);
      if (cached) {
        return successResponse(res, cached);
      }

      // Build date filter
      let dateFilter = '';
      const params = [];
      if (startDate && endDate) {
        dateFilter = 'WHERE created_at BETWEEN $1 AND $2';
        params.push(startDate, endDate);
      }

      // Get metrics from completed orders
      const metrics = await db.one(`
        SELECT
          COALESCE(SUM(total_amount), 0) as total_sales,
          COUNT(*) as total_orders,
          COALESCE(SUM(CASE WHEN items IS NOT NULL THEN
            (SELECT SUM((item->>'quantity')::int)
             FROM jsonb_array_elements(items) AS item)
          END), 0) as products_sold
        FROM orders
        ${dateFilter}
        ${dateFilter ? 'AND' : 'WHERE'} status = 'completed'
      `, params);

      // Get new customers count
      const { count: newCustomers } = await db.one(`
        SELECT COUNT(*) FROM customers
        WHERE created_at::date = CURRENT_DATE
      `);

      // Get yesterday's metrics for comparison
      const yesterdayMetrics = await db.one(`
        SELECT
          COALESCE(SUM(total_amount), 0) as total_sales,
          COUNT(*) as total_orders
        FROM orders
        WHERE created_at::date = CURRENT_DATE - INTERVAL '1 day'
        AND status = 'completed'
      `);

      // Calculate change percentages
      const calculateChange = (current, previous) => {
        if (previous === 0) return 0;
        return (((current - previous) / previous) * 100).toFixed(1);
      };

      const result = {
        totalSales: {
          value: parseFloat(metrics.total_sales),
          currency: 'USD',
          change: parseFloat(calculateChange(metrics.total_sales, yesterdayMetrics.total_sales)),
          changeType: metrics.total_sales >= yesterdayMetrics.total_sales ? 'increase' : 'decrease'
        },
        totalOrders: {
          value: parseInt(metrics.total_orders),
          change: parseFloat(calculateChange(metrics.total_orders, yesterdayMetrics.total_orders)),
          changeType: metrics.total_orders >= yesterdayMetrics.total_orders ? 'increase' : 'decrease'
        },
        productsSold: {
          value: parseInt(metrics.products_sold),
          change: 1.2,
          changeType: 'increase'
        },
        newCustomers: {
          value: parseInt(newCustomers),
          change: 0.5,
          changeType: 'increase'
        }
      };

      // Cache for 5 minutes
      await cacheHelper.set(cacheKey, result, 300);

      return successResponse(res, result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get revenue chart data
   */
  async getRevenueData(req, res, next) {
    try {
      const { period = 'week' } = req.query;

      const cacheKey = `dashboard:revenue:${period}`;

      // Check cache
      const cached = await cacheHelper.get(cacheKey);
      if (cached) {
        return successResponse(res, cached);
      }

      let query;
      let interval;

      // Query based on period
      if (period === 'week') {
        interval = '7 days';
        query = `
          SELECT
            TO_CHAR(created_at, 'Day') as label,
            EXTRACT(DOW FROM created_at) as day_order,
            COALESCE(SUM(CASE WHEN order_type = 'online' THEN total_amount ELSE 0 END), 0) as online,
            COALESCE(SUM(CASE WHEN order_type = 'offline' THEN total_amount ELSE 0 END), 0) as offline
          FROM orders
          WHERE created_at >= CURRENT_DATE - INTERVAL '${interval}'
          AND status = 'completed'
          GROUP BY EXTRACT(DOW FROM created_at), TO_CHAR(created_at, 'Day')
          ORDER BY EXTRACT(DOW FROM created_at)
        `;
      } else if (period === 'month') {
        interval = '30 days';
        query = `
          SELECT
            TO_CHAR(created_at, 'DD Mon') as label,
            COALESCE(SUM(CASE WHEN order_type = 'online' THEN total_amount ELSE 0 END), 0) as online,
            COALESCE(SUM(CASE WHEN order_type = 'offline' THEN total_amount ELSE 0 END), 0) as offline
          FROM orders
          WHERE created_at >= CURRENT_DATE - INTERVAL '${interval}'
          AND status = 'completed'
          GROUP BY created_at::date, TO_CHAR(created_at, 'DD Mon')
          ORDER BY created_at::date
        `;
      } else {
        interval = '365 days';
        query = `
          SELECT
            TO_CHAR(created_at, 'Mon') as label,
            COALESCE(SUM(CASE WHEN order_type = 'online' THEN total_amount ELSE 0 END), 0) as online,
            COALESCE(SUM(CASE WHEN order_type = 'offline' THEN total_amount ELSE 0 END), 0) as offline
          FROM orders
          WHERE created_at >= CURRENT_DATE - INTERVAL '${interval}'
          AND status = 'completed'
          GROUP BY EXTRACT(MONTH FROM created_at), TO_CHAR(created_at, 'Mon')
          ORDER BY EXTRACT(MONTH FROM created_at)
        `;
      }

      const data = await db.any(query);

      const result = {
        labels: data.map(d => d.label.trim()),
        online: data.map(d => parseFloat(d.online)),
        offline: data.map(d => parseFloat(d.offline))
      };

      // Cache for 10 minutes
      await cacheHelper.set(cacheKey, result, 600);

      return successResponse(res, result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get visitor insights
   */
  async getVisitorInsights(req, res, next) {
    try {
      const { period = 'week' } = req.query;

      const cacheKey = `dashboard:visitors:${period}`;

      const cached = await cacheHelper.get(cacheKey);
      if (cached) {
        return successResponse(res, cached);
      }

      // Get customer activity data
      const labels = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

      // In a real implementation, this would query actual visitor/customer data
      // For now, returning structured data
      const result = {
        labels,
        loyalCustomers: [30, 45, 35, 55, 45, 65, 55],
        newCustomers: [20, 35, 40, 30, 50, 45, 60],
        uniqueCustomers: [40, 30, 45, 40, 35, 50, 45],
        percentages: {
          loyal: 78,
          new: 15,
          unique: 7
        }
      };

      await cacheHelper.set(cacheKey, result, 600);

      return successResponse(res, result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get top products
   */
  async getTopProducts(req, res, next) {
    try {
      const { limit = 10, period = 'all' } = req.query;

      const cacheKey = `dashboard:top-products:${limit}:${period}`;

      const cached = await cacheHelper.get(cacheKey);
      if (cached) {
        return successResponse(res, cached);
      }

      let dateFilter = '';
      if (period !== 'all') {
        const intervals = {
          day: '1 day',
          week: '7 days',
          month: '30 days',
          year: '365 days'
        };
        dateFilter = `WHERE p.created_at >= CURRENT_DATE - INTERVAL '${intervals[period] || '30 days'}'`;
      }

      const products = await db.any(`
        SELECT
          p.id,
          p.name,
          p.sales_count as sales,
          p.popularity_score as popularity,
          COALESCE(SUM(oi.total_price), 0) as revenue
        FROM products p
        LEFT JOIN order_items oi ON oi.product_id = p.id
        ${dateFilter}
        GROUP BY p.id, p.name, p.sales_count, p.popularity_score
        ORDER BY p.sales_count DESC, p.popularity_score DESC
        LIMIT $1
      `, [limit]);

      const result = products.map((product, index) => ({
        id: product.id,
        rank: index + 1,
        name: product.name,
        popularity: product.popularity || 0,
        sales: product.sales || 0,
        revenue: parseFloat(product.revenue)
      }));

      await cacheHelper.set(cacheKey, result, 600);

      return successResponse(res, result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get customer satisfaction data
   */
  async getCustomerSatisfaction(req, res, next) {
    try {
      const cacheKey = 'dashboard:satisfaction';

      const cached = await cacheHelper.get(cacheKey);
      if (cached) {
        return successResponse(res, cached);
      }

      // Get last month and this month revenue
      const stats = await db.one(`
        SELECT
          COALESCE(SUM(CASE
            WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
            AND created_at < DATE_TRUNC('month', CURRENT_DATE)
            THEN total_amount ELSE 0 END), 0) as last_month,
          COALESCE(SUM(CASE
            WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE)
            THEN total_amount ELSE 0 END), 0) as this_month
        FROM orders
        WHERE status = 'completed'
      `);

      const result = {
        lastMonth: parseFloat(stats.last_month),
        thisMonth: parseFloat(stats.this_month),
        labels: ['', '', '', '', '', '', '', '', '', ''],
        lastMonthData: [30, 40, 35, 45, 40, 50, 45, 55, 50, 52],
        thisMonthData: [25, 35, 45, 40, 50, 45, 55, 50, 60, 58]
      };

      await cacheHelper.set(cacheKey, result, 600);

      return successResponse(res, result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get target vs reality data
   */
  async getTargetVsReality(req, res, next) {
    try {
      const cacheKey = 'dashboard:target-reality';

      const cached = await cacheHelper.get(cacheKey);
      if (cached) {
        return successResponse(res, cached);
      }

      // Get monthly sales data
      const monthlyData = await db.any(`
        SELECT
          TO_CHAR(created_at, 'Mon') as month,
          COALESCE(SUM(total_amount), 0) as reality
        FROM orders
        WHERE created_at >= CURRENT_DATE - INTERVAL '8 months'
        AND status = 'completed'
        GROUP BY EXTRACT(MONTH FROM created_at), TO_CHAR(created_at, 'Mon')
        ORDER BY EXTRACT(MONTH FROM created_at)
        LIMIT 8
      `);

      const result = {
        labels: monthlyData.map(d => d.month),
        reality: monthlyData.map(d => parseFloat(d.reality)),
        target: monthlyData.map(d => parseFloat(d.reality) * 1.15), // Target is 15% higher
        realitySales: monthlyData.reduce((sum, d) => sum + parseFloat(d.reality), 0),
        targetSales: monthlyData.reduce((sum, d) => sum + parseFloat(d.reality), 0) * 1.15
      };

      await cacheHelper.set(cacheKey, result, 600);

      return successResponse(res, result);

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
