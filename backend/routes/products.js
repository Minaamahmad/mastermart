const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const { storage, cloudinary } = require('../config/cloudinary');
const { isValidObjectId } = require('../utils/validators');
const { handleError, handleNotFound } = require('../utils/errorHandler');
const { processPriceAndDiscount } = require('../utils/productHelpers');
const { normalizeBoolean } = require('../utils/inputHelpers');
const { deleteCloudinaryImage } = require('../utils/cloudinaryHelpers');
const validateId = require('../middleware/validateId');

// Wrapper to handle multer errors
const handleMulterUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large. Maximum size is 5MB' });
          }
          return res.status(400).json({ message: err.message });
        }
        // Handle file filter errors
        return res.status(400).json({ message: err.message || 'File upload error' });
      }
      next();
    });
  };
};

// Configure multer for file uploads with Cloudinary
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed (jpg, jpeg, png, gif, webp)'));
  }
});

// GET all products (public)
router.get('/', async (req, res) => {
  try {
    const { featured, category } = req.query;
    let query = {};
    if (featured === 'true') query.featured = true;
    if (category) query.category = category;
    
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    handleError(error, res, 500, 'Failed to fetch products');
  }
});

// GET single product (public)
router.get('/:id', validateId('id'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return handleNotFound(res, 'Product');
    }
    res.json(product);
  } catch (error) {
    handleError(error, res, 500, 'Failed to fetch product');
  }
});

// POST create product (admin only)
router.post('/', authMiddleware, handleMulterUpload(upload.single('image')), async (req, res) => {
  try {
    const { name, description, price, originalPrice, discount, category, stock, featured } = req.body;
    
    // Parse and process price/discount
    const priceNum = parseFloat(price);
    const originalPriceNum = originalPrice ? parseFloat(originalPrice) : null;
    const discountNum = discount ? parseFloat(discount) : 0;
    
    const { originalPrice: finalOriginalPrice, discount: finalDiscount } = 
      processPriceAndDiscount(priceNum, originalPriceNum, discountNum);

    // Create product - Mongoose will handle validation
    const product = new Product({
      name: name?.trim(),
      description: description?.trim(),
      price: priceNum,
      originalPrice: finalOriginalPrice,
      discount: finalDiscount,
      category: category || 'General',
      stock: stock !== undefined ? parseInt(stock) : 0,
      featured: normalizeBoolean(featured),
      image: req.file?.path || ''
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    handleError(error, res, 400, 'Failed to create product');
  }
});

// PUT update product (admin only)
router.put('/:id', authMiddleware, validateId('id'), handleMulterUpload(upload.single('image')), async (req, res) => {
  try {
    const { name, description, price, originalPrice, discount, category, stock, featured } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return handleNotFound(res, 'Product');
    }

    // Update fields
    if (name !== undefined) product.name = name.trim();
    if (description !== undefined) product.description = description.trim();
    if (category !== undefined) product.category = category || 'General';
    if (stock !== undefined) product.stock = parseInt(stock);
    if (featured !== undefined) product.featured = normalizeBoolean(featured);
    
    // Handle price and discount
    if (price !== undefined) {
      const priceNum = parseFloat(price);
      const originalPriceNum = originalPrice !== undefined 
        ? (originalPrice ? parseFloat(originalPrice) : null) 
        : product.originalPrice;
      const discountNum = discount !== undefined ? parseFloat(discount) : product.discount;
      
      const { originalPrice: finalOriginalPrice, discount: finalDiscount } = 
        processPriceAndDiscount(priceNum, originalPriceNum, discountNum);
      
      product.price = priceNum;
      product.originalPrice = finalOriginalPrice;
      product.discount = finalDiscount;
    } else if (originalPrice !== undefined || discount !== undefined) {
      // Only discount or originalPrice changed, recalculate
      const originalPriceNum = originalPrice !== undefined 
        ? (originalPrice ? parseFloat(originalPrice) : null) 
        : product.originalPrice;
      const discountNum = discount !== undefined ? parseFloat(discount) : product.discount;
      
      const { originalPrice: finalOriginalPrice, discount: finalDiscount } = 
        processPriceAndDiscount(product.price, originalPriceNum, discountNum);
      
      product.originalPrice = finalOriginalPrice;
      product.discount = finalDiscount;
    }
    
    // Handle image update
    if (req.file) {
      if (product.image) {
        await deleteCloudinaryImage(product.image);
      }
      product.image = req.file.path;
    }

    await product.save();
    res.json(product);
  } catch (error) {
    handleError(error, res, 400, 'Failed to update product');
  }
});

// DELETE product (admin only)
router.delete('/:id', authMiddleware, validateId('id'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return handleNotFound(res, 'Product');
    }

    // Delete image from Cloudinary if it exists
    if (product.image) {
      await deleteCloudinaryImage(product.image);
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    handleError(error, res, 500, 'Failed to delete product');
  }
});

module.exports = router;

