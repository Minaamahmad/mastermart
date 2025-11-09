const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30
  },
  password: {
    type: String,
    required: true
  },
  passwordHistory: [{
    password: String,
    changedAt: { type: Date, default: Date.now }
  }],
  failedLoginAttempts: {
    count: { type: Number, default: 0 },
    lastAttempt: Date,
    lockedUntil: Date
  },
  lastLogin: {
    timestamp: Date,
    ip: String,
    userAgent: String
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  // Hash password with increased rounds for better security
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = new Date();
  next();
});

adminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

adminSchema.methods.isPasswordInHistory = async function(candidatePassword) {
  if (!this.passwordHistory || this.passwordHistory.length === 0) {
    return false;
  }
  
  for (const oldPassword of this.passwordHistory) {
    if (oldPassword.password) {
      const isMatch = await bcrypt.compare(candidatePassword, oldPassword.password);
      if (isMatch) return true;
    }
  }
  return false;
};

adminSchema.methods.addPasswordToHistory = function(newHashedPassword) {
  if (this.passwordHistory.length >= 5) {
    this.passwordHistory.shift(); // Keep only last 5 passwords
  }
  this.passwordHistory.push({
    password: newHashedPassword,
    changedAt: new Date()
  });
  return this.save();
};

adminSchema.methods.lockAccount = function(lockoutMinutes = 15) {
  this.isLocked = true;
  this.failedLoginAttempts.lockedUntil = new Date(Date.now() + lockoutMinutes * 60 * 1000);
  this.failedLoginAttempts.count = 0;
  return this.save();
};

adminSchema.methods.unlockAccount = function() {
  this.isLocked = false;
  this.failedLoginAttempts.count = 0;
  this.failedLoginAttempts.lockedUntil = null;
  return this.save();
};

adminSchema.methods.incrementFailedAttempts = function() {
  this.failedLoginAttempts.count += 1;
  this.failedLoginAttempts.lastAttempt = new Date();
  return this.save();
};

adminSchema.methods.resetFailedAttempts = function() {
  this.failedLoginAttempts.count = 0;
  this.failedLoginAttempts.lastAttempt = null;
  return this.save();
};

adminSchema.methods.updateLastLogin = function(ip, userAgent) {
  this.lastLogin = {
    timestamp: new Date(),
    ip: ip,
    userAgent: userAgent
  };
  return this.save();
};

module.exports = mongoose.model('Admin', adminSchema);

