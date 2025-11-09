const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { optionalAuth } = require('../middleware/auth0');
const { isValidObjectId } = require('../utils/validators');
const { handleError, handleNotFound } = require('../utils/errorHandler');
const { findUserByAuth0Id } = require('../utils/userHelpers');
const validateId = require('../middleware/validateId');

// POST create order (public - supports both authenticated and guest users)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { customerName, customerPhone, customerAddress, customerEmail, items } = req.body;

    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item' });
    }

    let totalAmount = 0;
    const orderItems = [];
    let userId = null;

    // If user is authenticated, get user info
    if (req.user) {
      const user = await findUserByAuth0Id(req.user.sub);
      if (user) {
        userId = user._id;
      }
    }

    // Validate items and calculate total
    for (const item of items) {
      if (!isValidObjectId(item.productId)) {
        return res.status(400).json({ message: `Invalid product ID: ${item.productId}` });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return handleNotFound(res, `Product ${item.productId}`);
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Create order - Mongoose will handle validation
    const order = new Order({
      user: userId,
      customerName,
      customerEmail: customerEmail || null,
      customerPhone,
      customerAddress,
      items: orderItems,
      totalAmount,
      paymentMethod: 'Cash on Delivery',
      status: 'Pending'
    });

    await order.save();

    // If user is authenticated, add order to user's orders
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $push: { orders: order._id }
      });
    }

    await order.populate('items.product', 'name image');
    
    res.status(201).json(order);
  } catch (error) {
    handleError(error, res, 400, 'Failed to create order');
  }
});

// GET all orders (admin only) - must be before /:id route
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    handleError(error, res, 500, 'Failed to fetch orders');
  }
});

// GET single order (public - for order confirmation)
router.get('/:id', validateId('id'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name image description');
    
    if (!order) {
      return handleNotFound(res, 'Order');
    }
    
    res.json(order);
  } catch (error) {
    handleError(error, res, 500, 'Failed to fetch order');
  }
});

// PUT update order status (admin only)
router.put('/:id/status', authMiddleware, validateId('id'), async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return handleNotFound(res, 'Order');
    }

    // Update status - Mongoose enum validation will handle it
    order.status = status;
    await order.save();
    await order.populate('items.product', 'name image');
    
    res.json(order);
  } catch (error) {
    handleError(error, res, 400, 'Failed to update order status');
  }
});

module.exports = router;

