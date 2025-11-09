const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyAuth0Token } = require('../middleware/auth0');
const { handleError, handleNotFound } = require('../utils/errorHandler');
const { findUserByAuth0Id } = require('../utils/userHelpers');

// Helper function to format user response
const formatUserResponse = (user) => ({
  id: user._id,
  auth0Id: user.auth0Id,
  email: user.email,
  name: user.name,
  picture: user.picture,
  provider: user.provider,
  phone: user.phone,
  address: user.address,
  createdAt: user.createdAt,
  lastLogin: user.lastLogin
});

// GET current user profile
router.get('/me', verifyAuth0Token, async (req, res) => {
  try {
    const user = await findUserByAuth0Id(req.user.sub);
    
    if (!user) {
      return handleNotFound(res, 'User');
    }

    res.json(formatUserResponse(user));
  } catch (error) {
    handleError(error, res, 500, 'Failed to fetch user profile');
  }
});

// PUT update user profile
router.put('/me', verifyAuth0Token, async (req, res) => {
  try {
    const { phone, address } = req.body;
    const user = await findUserByAuth0Id(req.user.sub);

    if (!user) {
      return handleNotFound(res, 'User');
    }

    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    await user.save();

    res.json(formatUserResponse(user));
  } catch (error) {
    handleError(error, res, 400, 'Failed to update user profile');
  }
});

// POST sync user from Auth0 (called after login)
router.post('/sync', verifyAuth0Token, async (req, res) => {
  try {
    // Create user profile from Auth0 token
    const auth0Profile = {
      sub: req.user.sub,
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture
    };

    const user = await User.findOrCreate(auth0Profile);

    res.json(formatUserResponse(user));
  } catch (error) {
    handleError(error, res, 500, 'Failed to sync user');
  }
});

// GET user orders
router.get('/me/orders', verifyAuth0Token, async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.user.sub })
      .populate({
        path: 'orders',
        populate: {
          path: 'items.product',
          select: 'name image'
        }
      })
      .sort({ 'orders.createdAt': -1 });

    if (!user) {
      return handleNotFound(res, 'User');
    }

    res.json(user.orders || []);
  } catch (error) {
    handleError(error, res, 500, 'Failed to fetch user orders');
  }
});

module.exports = router;

