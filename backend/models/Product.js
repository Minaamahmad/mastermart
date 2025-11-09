const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [1, 'Product name cannot be empty'],
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    minlength: [10, 'Product description must be at least 10 characters'],
    maxlength: [2000, 'Product description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: function(value) {
        return value > 0;
      },
      message: 'Price must be greater than 0'
    }
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative'],
    default: null,
    validate: {
      validator: function(value) {
        if (value === null || value === undefined) return true;
        return value > this.price;
      },
      message: 'Original price must be greater than selling price'
    }
  },
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%'],
    default: 0
  },
  image: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: {
      values: ['General', 'Electronics', 'Clothing', 'Food'],
      message: 'Category must be one of: General, Electronics, Clothing, Food'
    },
    default: 'General'
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Stock must be an integer'
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);

