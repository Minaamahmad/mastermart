const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const { loginRateLimiter } = require('../middleware/security');
const { validatePassword, isPasswordSimilarToUsername } = require('../utils/passwordValidator');
const { generateTokens, verifyRefreshToken, generateAccessToken } = require('../utils/jwtHelpers');
const { handleError } = require('../utils/errorHandler');
const { normalizeUsername, normalizePassword } = require('../utils/inputHelpers');

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

// POST admin login
router.post('/login', loginRateLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Input validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    // Normalize input
    const trimmedUsername = normalizeUsername(username);
    const trimmedPassword = normalizePassword(password);

    if (!trimmedUsername || !trimmedPassword) {
      return res.status(400).json({ message: 'Username and password cannot be empty' });
    }

    // Find admin
    const admin = await Admin.findOne({ username: trimmedUsername });
    
    // Check if account is locked
    if (admin && admin.isLocked) {
      if (admin.failedLoginAttempts.lockedUntil && admin.failedLoginAttempts.lockedUntil > new Date()) {
        const minutesLeft = Math.ceil((admin.failedLoginAttempts.lockedUntil - new Date()) / 60000);
        return res.status(423).json({ 
          message: `Account is locked due to too many failed attempts. Please try again in ${minutesLeft} minute(s).` 
        });
      } else {
        // Lockout expired, unlock account
        await admin.unlockAccount();
      }
    }
    
    // Always perform password comparison to prevent timing attacks
    let isMatch = false;
    if (admin) {
      isMatch = await admin.comparePassword(trimmedPassword);
    } else {
      // Fake password comparison to prevent timing attacks
      await bcrypt.compare(trimmedPassword, '$2a$10$fakeHashToPreventTimingAttacks');
    }

    if (!admin || !isMatch) {
      // Record failed attempt for this user
      if (admin) {
        await admin.incrementFailedAttempts();
        
        // Lock account after max failed attempts
        if (admin.failedLoginAttempts.count >= MAX_FAILED_ATTEMPTS) {
          await admin.lockAccount(LOCKOUT_MINUTES);
          return res.status(423).json({ 
            message: `Account locked due to too many failed attempts. Please try again in ${LOCKOUT_MINUTES} minutes.` 
          });
        }
      }
      
      // Generic error message to prevent username enumeration
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Successful login - reset failed attempts and update last login
    await admin.resetFailedAttempts();
    await admin.unlockAccount(); // Ensure account is unlocked
    await admin.updateLastLogin(clientIp, userAgent);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({ 
      id: admin._id, 
      username: admin.username 
    });

    res.json({
      token: accessToken,
      refreshToken: refreshToken,
      admin: {
        id: admin._id,
        username: admin.username,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    handleError(error, res, 500, 'An error occurred during login');
  }
});

// POST create admin (for initial setup - remove in production or protect with super admin)
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    const trimmedUsername = normalizeUsername(username);
    const trimmedPassword = normalizePassword(password);

    if (!trimmedUsername || trimmedUsername.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters long' });
    }

    if (trimmedUsername.length > 30) {
      return res.status(400).json({ message: 'Username must be less than 30 characters' });
    }

    // Enhanced password validation
    const passwordValidation = validatePassword(trimmedPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        message: passwordValidation.message,
        strength: passwordValidation.strength,
        score: passwordValidation.score
      });
    }

    // Check if password is similar to username
    if (isPasswordSimilarToUsername(trimmedPassword, trimmedUsername)) {
      return res.status(400).json({ message: 'Password cannot be similar to username' });
    }

    const existingAdmin = await Admin.findOne({ username: trimmedUsername });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = new Admin({ username: trimmedUsername, password: trimmedPassword });
    await admin.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({ 
      id: admin._id, 
      username: admin.username 
    });

    res.status(201).json({
      token: accessToken,
      refreshToken: refreshToken,
      admin: {
        id: admin._id,
        username: admin.username
      }
    });
  } catch (error) {
    handleError(error, res, 400, 'Failed to create admin account');
  }
});

// POST refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const decoded = verifyRefreshToken(refreshToken);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ message: 'Admin not found' });
    }

    // Generate new access token
    const accessToken = generateAccessToken({ 
      id: admin._id, 
      username: admin.username 
    });

    res.json({ token: accessToken });
  } catch (error) {
    handleError(error, res, 401, 'Invalid or expired refresh token');
  }
});

// GET verify token
router.get('/verify', require('../middleware/auth'), (req, res) => {
  res.json({ admin: req.admin });
});

module.exports = router;
