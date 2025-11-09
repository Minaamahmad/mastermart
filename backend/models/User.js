const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  auth0Id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    index: true,
    validate: {
      validator: function(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: 'Please provide a valid email address'
    }
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  picture: {
    type: String,
    default: ''
  },
  provider: {
    type: String,
    enum: ['google', 'facebook', 'auth0'],
    default: 'auth0'
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find or create user from Auth0 profile
userSchema.statics.findOrCreate = async function(auth0Profile) {
  let user = await this.findOne({ auth0Id: auth0Profile.sub });
  
  if (!user) {
    // Extract provider from auth0 ID (e.g., google-oauth2|123456)
    const provider = auth0Profile.sub.split('|')[0] === 'google-oauth2' 
      ? 'google' 
      : auth0Profile.sub.split('|')[0] === 'facebook' 
      ? 'facebook' 
      : 'auth0';
    
    user = new this({
      auth0Id: auth0Profile.sub,
      email: auth0Profile.email,
      name: auth0Profile.name,
      picture: auth0Profile.picture || '',
      provider: provider,
      lastLogin: new Date()
    });
    await user.save();
  } else {
    // Update user info on login
    user.name = auth0Profile.name || user.name;
    user.picture = auth0Profile.picture || user.picture;
    user.email = auth0Profile.email || user.email;
    user.lastLogin = new Date();
    await user.save();
  }
  
  return user;
};

module.exports = mongoose.model('User', userSchema);

