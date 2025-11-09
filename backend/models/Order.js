const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    validate: {
      validator: Number.isInteger,
      message: 'Quantity must be an integer'
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional - allow guest checkout
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    minlength: [2, 'Customer name must be at least 2 characters'],
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  customerEmail: {
    type: String,
    required: false,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(value) {
        if (!value) return true; // Optional field
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: 'Please provide a valid email address'
    }
  },
  customerPhone: {
    type: String,
    required: [true, 'Customer phone is required'],
    trim: true,
    minlength: [10, 'Phone number must be at least 10 characters'],
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  customerAddress: {
    type: String,
    required: [true, 'Customer address is required'],
    trim: true,
    minlength: [10, 'Address must be at least 10 characters'],
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  items: {
    type: [orderItemSchema],
    required: [true, 'Order items are required'],
    validate: {
      validator: function(value) {
        return value && value.length > 0;
      },
      message: 'Order must have at least one item'
    }
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative'],
    validate: {
      validator: function(value) {
        return value > 0;
      },
      message: 'Total amount must be greater than 0'
    }
  },
  paymentMethod: {
    type: String,
    enum: {
      values: ['Cash on Delivery', 'Credit Card', 'Debit Card', 'Online Payment'],
      message: 'Invalid payment method'
    },
    default: 'Cash on Delivery'
  },
  status: {
    type: String,
    enum: {
      values: ['Pending', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled'],
      message: 'Invalid order status'
    },
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);

