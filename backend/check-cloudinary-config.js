// Script to check Cloudinary configuration
require('dotenv').config();

const cloudinary = require('cloudinary').v2;

console.log('=== Cloudinary Configuration Check ===\n');

// Check environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('1. Environment Variables:');
console.log('   CLOUDINARY_CLOUD_NAME:', cloudName ? '✓ Set' : '✗ Missing');
console.log('   CLOUDINARY_API_KEY:', apiKey ? '✓ Set' : '✗ Missing');
console.log('   CLOUDINARY_API_SECRET:', apiSecret ? '✓ Set (hidden)' : '✗ Missing');
console.log('');

// Validate values
if (!cloudName || !apiKey || !apiSecret) {
  console.log('❌ ERROR: Missing Cloudinary environment variables!');
  console.log('   Please add them to your .env file:');
  console.log('   CLOUDINARY_CLOUD_NAME=your_cloud_name');
  console.log('   CLOUDINARY_API_KEY=your_api_key');
  console.log('   CLOUDINARY_API_SECRET=your_api_secret');
  process.exit(1);
}

// Check if values are placeholders
if (cloudName.includes('your_cloud_name') || 
    apiKey.includes('your_api_key') || 
    apiSecret.includes('your_api_secret')) {
  console.log('⚠️  WARNING: You still have placeholder values in your .env file!');
  console.log('   Please replace them with your actual Cloudinary credentials.');
  process.exit(1);
}

// Test Cloudinary connection
console.log('2. Testing Cloudinary Connection:');
try {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
  
  // Try to ping Cloudinary (list resources with limit 1)
  cloudinary.api.ping((error, result) => {
    if (error) {
      console.log('   ❌ Connection failed:', error.message);
      console.log('');
      console.log('   Possible issues:');
      console.log('   - Invalid credentials');
      console.log('   - Network connection problem');
      console.log('   - Cloudinary account issue');
      process.exit(1);
    } else {
      console.log('   ✓ Connection successful!');
      console.log('   ✓ Status:', result.status);
      console.log('');
      console.log('✅ All Cloudinary configuration is correct!');
      console.log('');
      console.log('Storage Configuration:');
      console.log('   Folder: ecommerce-products');
      console.log('   Formats: jpg, jpeg, png, gif, webp');
      console.log('   Max size: 800x800px');
      process.exit(0);
    }
  });
} catch (error) {
  console.log('   ❌ Configuration error:', error.message);
  process.exit(1);
}

