const { db } = require('../config/database');
const { cacheHelper } = require('../config/redis');
const { successResponse } = require('../utils/response');
const { ValidationError, NotFoundError } = require('../utils/errors');

class ProductController {
  /**
   * Get all products
   */
  async getAllProducts(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        category,
        minPrice,
        maxPrice,
        inStock,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = req.query;

      const offset = (page - 1) * limit;

      // Build filter
      const filters = [];
      const params = [];
      let paramCount = 1;

      if (search) {
        filters.push(`(name ILIKE $${paramCount} OR description ILIKE $${paramCount})`);
        params.push(`%${search}%`);
        paramCount++;
      }

      if (category) {
        filters.push(`category = $${paramCount++}`);
        params.push(category);
      }

      if (minPrice) {
        filters.push(`price >= $${paramCount++}`);
        params.push(minPrice);
      }

      if (maxPrice) {
        filters.push(`price <= $${paramCount++}`);
        params.push(maxPrice);
      }

      if (inStock !== undefined) {
        if (inStock === 'true') {
          filters.push(`stock_quantity > 0`);
        } else {
          filters.push(`stock_quantity = 0`);
        }
      }

      const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

      // Allowed sort columns
      const allowedSort = ['created_at', 'name', 'price', 'stock_quantity', 'sales_count'];
      const sortColumn = allowedSort.includes(sortBy) ? sortBy : 'created_at';
      const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

      // Get products
      params.push(limit, offset);
      const products = await db.any(`
        SELECT
          id,
          name,
          description,
          price,
          category,
          stock_quantity,
          image_url,
          sales_count,
          popularity_score,
          created_at,
          updated_at
        FROM products
        ${whereClause}
        ORDER BY ${sortColumn} ${order}
        LIMIT $${paramCount++} OFFSET $${paramCount++}
      `, params);

      // Get total count
      const { count } = await db.one(`
        SELECT COUNT(*) FROM products ${whereClause}
      `, params.slice(0, -2)); // Remove limit and offset params

      return successResponse(res, {
        products,
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
   * Get product by ID
   */
  async getProductById(req, res, next) {
    try {
      const { id } = req.params;

      const cacheKey = `product:${id}`;

      // Check cache
      const cached = await cacheHelper.get(cacheKey);
      if (cached) {
        return successResponse(res, cached);
      }

      const product = await db.oneOrNone(
        'SELECT * FROM products WHERE id = $1',
        [id]
      );

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      // Cache for 10 minutes
      await cacheHelper.set(cacheKey, product, 600);

      return successResponse(res, product);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new product
   */
  async createProduct(req, res, next) {
    try {
      const {
        name,
        description,
        price,
        category,
        stockQuantity = 0,
        imageUrl,
        sku
      } = req.body;

      // Validate required fields
      if (!name || !price) {
        throw new ValidationError('Name and price are required');
      }

      // Validate price
      if (price < 0) {
        throw new ValidationError('Price cannot be negative');
      }

      // Check if SKU already exists
      if (sku) {
        const existing = await db.oneOrNone(
          'SELECT id FROM products WHERE sku = $1',
          [sku]
        );

        if (existing) {
          throw new ValidationError('Product with this SKU already exists');
        }
      }

      // Create product
      const product = await db.one(`
        INSERT INTO products (
          name,
          description,
          price,
          category,
          stock_quantity,
          image_url,
          sku,
          sales_count,
          popularity_score
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0)
        RETURNING *
      `, [name, description, price, category, stockQuantity, imageUrl, sku]);

      return successResponse(res, product, 'Product created successfully', 201);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Update product
   */
  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        price,
        category,
        stockQuantity,
        imageUrl,
        sku
      } = req.body;

      // Check if product exists
      const existing = await db.oneOrNone(
        'SELECT id FROM products WHERE id = $1',
        [id]
      );

      if (!existing) {
        throw new NotFoundError('Product not found');
      }

      // Check if SKU already exists (if updating SKU)
      if (sku) {
        const skuExists = await db.oneOrNone(
          'SELECT id FROM products WHERE sku = $1 AND id != $2',
          [sku, id]
        );

        if (skuExists) {
          throw new ValidationError('Product with this SKU already exists');
        }
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
      if (price !== undefined) {
        if (price < 0) {
          throw new ValidationError('Price cannot be negative');
        }
        updates.push(`price = $${paramCount++}`);
        params.push(price);
      }
      if (category !== undefined) {
        updates.push(`category = $${paramCount++}`);
        params.push(category);
      }
      if (stockQuantity !== undefined) {
        updates.push(`stock_quantity = $${paramCount++}`);
        params.push(stockQuantity);
      }
      if (imageUrl !== undefined) {
        updates.push(`image_url = $${paramCount++}`);
        params.push(imageUrl);
      }
      if (sku !== undefined) {
        updates.push(`sku = $${paramCount++}`);
        params.push(sku);
      }

      if (updates.length === 0) {
        throw new ValidationError('No fields to update');
      }

      updates.push(`updated_at = NOW()`);
      params.push(id);

      const product = await db.one(`
        UPDATE products
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `, params);

      // Invalidate cache
      await cacheHelper.del(`product:${id}`);

      return successResponse(res, product, 'Product updated successfully');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;

      // Check if product exists
      const existing = await db.oneOrNone(
        'SELECT id FROM products WHERE id = $1',
        [id]
      );

      if (!existing) {
        throw new NotFoundError('Product not found');
      }

      // Check if product has orders
      const hasOrders = await db.oneOrNone(
        'SELECT id FROM order_items WHERE product_id = $1 LIMIT 1',
        [id]
      );

      if (hasOrders) {
        throw new ValidationError('Cannot delete product with existing orders. Consider marking it as out of stock instead.');
      }

      // Delete product
      await db.none('DELETE FROM products WHERE id = $1', [id]);

      // Invalidate cache
      await cacheHelper.del(`product:${id}`);

      return successResponse(res, null, 'Product deleted successfully');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Update product stock
   */
  async updateStock(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity, operation = 'set' } = req.body;

      if (quantity === undefined) {
        throw new ValidationError('Quantity is required');
      }

      // Check if product exists
      const existing = await db.oneOrNone(
        'SELECT stock_quantity FROM products WHERE id = $1',
        [id]
      );

      if (!existing) {
        throw new NotFoundError('Product not found');
      }

      let newQuantity;

      if (operation === 'set') {
        newQuantity = quantity;
      } else if (operation === 'add') {
        newQuantity = existing.stock_quantity + quantity;
      } else if (operation === 'subtract') {
        newQuantity = existing.stock_quantity - quantity;
      } else {
        throw new ValidationError('Invalid operation. Must be "set", "add", or "subtract"');
      }

      if (newQuantity < 0) {
        throw new ValidationError('Stock quantity cannot be negative');
      }

      const product = await db.one(
        'UPDATE products SET stock_quantity = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [newQuantity, id]
      );

      // Invalidate cache
      await cacheHelper.del(`product:${id}`);

      return successResponse(res, product, 'Stock updated successfully');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product categories
   */
  async getCategories(req, res, next) {
    try {
      const categories = await db.any(`
        SELECT
          category,
          COUNT(*) as product_count
        FROM products
        WHERE category IS NOT NULL
        GROUP BY category
        ORDER BY product_count DESC
      `);

      return successResponse(res, categories);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get low stock products
   */
  async getLowStock(req, res, next) {
    try {
      const { threshold = 10 } = req.query;

      const products = await db.any(`
        SELECT
          id,
          name,
          sku,
          stock_quantity,
          category,
          price
        FROM products
        WHERE stock_quantity <= $1 AND stock_quantity > 0
        ORDER BY stock_quantity ASC
      `, [threshold]);

      return successResponse(res, products);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get out of stock products
   */
  async getOutOfStock(req, res, next) {
    try {
      const products = await db.any(`
        SELECT
          id,
          name,
          sku,
          category,
          price,
          updated_at
        FROM products
        WHERE stock_quantity = 0
        ORDER BY updated_at DESC
      `);

      return successResponse(res, products);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product statistics
   */
  async getProductStats(req, res, next) {
    try {
      const stats = await db.one(`
        SELECT
          COUNT(*) as total_products,
          COUNT(CASE WHEN stock_quantity > 0 THEN 1 END) as in_stock_products,
          COUNT(CASE WHEN stock_quantity = 0 THEN 1 END) as out_of_stock_products,
          COUNT(CASE WHEN stock_quantity <= 10 AND stock_quantity > 0 THEN 1 END) as low_stock_products,
          COALESCE(SUM(stock_quantity), 0) as total_stock,
          COALESCE(AVG(price), 0) as avg_price
        FROM products
      `);

      return successResponse(res, {
        totalProducts: parseInt(stats.total_products),
        inStockProducts: parseInt(stats.in_stock_products),
        outOfStockProducts: parseInt(stats.out_of_stock_products),
        lowStockProducts: parseInt(stats.low_stock_products),
        totalStock: parseInt(stats.total_stock),
        avgPrice: parseFloat(stats.avg_price)
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
