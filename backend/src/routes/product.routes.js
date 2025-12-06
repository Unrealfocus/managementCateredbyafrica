const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { apiLimiter } = require('../middleware/rateLimit.middleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Apply rate limiting
router.use(apiLimiter);

/**
 * @route   GET /api/v1/products
 * @desc    Get all products
 * @access  Private
 */
router.get('/', productController.getAllProducts);

/**
 * @route   GET /api/v1/products/stats
 * @desc    Get product statistics
 * @access  Private
 */
router.get('/stats', productController.getProductStats);

/**
 * @route   GET /api/v1/products/categories
 * @desc    Get product categories
 * @access  Private
 */
router.get('/categories', productController.getCategories);

/**
 * @route   GET /api/v1/products/low-stock
 * @desc    Get low stock products
 * @access  Private
 */
router.get('/low-stock', productController.getLowStock);

/**
 * @route   GET /api/v1/products/out-of-stock
 * @desc    Get out of stock products
 * @access  Private
 */
router.get('/out-of-stock', productController.getOutOfStock);

/**
 * @route   GET /api/v1/products/:id
 * @desc    Get product by ID
 * @access  Private
 */
router.get('/:id', productController.getProductById);

/**
 * @route   POST /api/v1/products
 * @desc    Create new product
 * @access  Private
 */
router.post('/', productController.createProduct);

/**
 * @route   PUT /api/v1/products/:id
 * @desc    Update product
 * @access  Private
 */
router.put('/:id', productController.updateProduct);

/**
 * @route   PATCH /api/v1/products/:id/stock
 * @desc    Update product stock
 * @access  Private
 */
router.patch('/:id/stock', productController.updateStock);

/**
 * @route   DELETE /api/v1/products/:id
 * @desc    Delete product
 * @access  Private
 */
router.delete('/:id', productController.deleteProduct);

module.exports = router;
