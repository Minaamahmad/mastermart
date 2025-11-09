# E-commerce Application - Complete Documentation

## 📚 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Setup Instructions](#setup-instructions)
4. [Authentication (Auth0)](#authentication-auth0)
5. [Cloudinary Setup](#cloudinary-setup)
6. [Security Features](#security-features)
7. [Bugs Fixed & Improvements](#bugs-fixed--improvements)
8. [Code Cleanup & Refactoring](#code-cleanup--refactoring)
9. [Learning Roadmap](#learning-roadmap)
10. [API Endpoints](#api-endpoints)
11. [Environment Variables](#environment-variables)

---

## 🎯 Project Overview

This is a full-stack e-commerce application built with React (frontend) and Node.js/Express (backend). The application supports:

- **Customer Features**: Browse products, add to cart, checkout (guest or authenticated)
- **Admin Features**: Manage products, view orders, update order status
- **Authentication**: Auth0 for customers (Google/Facebook login), JWT for admin
- **Image Storage**: Cloudinary for product images
- **Database**: MongoDB with Mongoose

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Navigation/routing
- **Auth0 React SDK** - Customer authentication
- **Axios** - HTTP requests

### Backend
- **Node.js + Express** - Server framework
- **MongoDB + Mongoose** - Database and ODM
- **Auth0** - Customer authentication
- **JWT** - Admin authentication
- **Cloudinary** - Image storage
- **Multer** - File uploads
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Auth0 account (free)
- Cloudinary account (free)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```env
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/ecommerce

   # Server
   PORT=5000

   # JWT Secret (Admin)
   JWT_SECRET=your_jwt_secret_key_here

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Auth0
   AUTH0_DOMAIN=your-domain.auth0.com
   AUTH0_CLIENT_ID=your_client_id
   AUTH0_AUDIENCE=your_client_id
   ```

4. **Start server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```env
   # API URL
   VITE_API_URL=http://localhost:5000/api

   # Auth0
   VITE_AUTH0_DOMAIN=your-domain.auth0.com
   VITE_AUTH0_CLIENT_ID=your_client_id
   VITE_AUTH0_AUDIENCE=your_client_id
   VITE_AUTH0_REDIRECT_URI=http://localhost:3000/callback
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

---

## 🔐 Authentication (Auth0)

### Setup Auth0

1. **Create Auth0 Account**
   - Go to [https://auth0.com](https://auth0.com)
   - Sign up for a free account

2. **Create Application**
   - Go to Applications → Create Application
   - Name: "E-commerce App"
   - Type: **Single Page Web Applications**
   - Click Create

3. **Configure Application Settings**
   - **Allowed Callback URLs**: `http://localhost:3000/callback`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`
   - **Important**: Clear "Initiate Login URI" field (leave empty)

4. **Enable Social Connections**
   - Go to Authentication → Social
   - Enable Google and/or Facebook
   - Configure OAuth apps (Google Cloud Console, Facebook Developers)

5. **Enable Connections in Application**
   - Go to Applications → Your App → Connections
   - Enable: Username-Password-Authentication, Google, Facebook

### Auth0 Environment Variables

**Backend** (`backend/.env`):
```env
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_AUDIENCE=your_client_id
```

**Frontend** (`frontend/.env`):
```env
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_AUDIENCE=your_client_id
VITE_AUTH0_REDIRECT_URI=http://localhost:3000/callback
```

### Auth0 Features

- ✅ **Social Login**: Google, Facebook
- ✅ **Email/Password**: Via Auth0
- ✅ **User Management**: Automatic user creation
- ✅ **Order History**: For authenticated users
- ✅ **Guest Checkout**: Still available

### Troubleshooting Auth0

- **"Invalid callback URL"**: Check callback URL in Auth0 dashboard matches frontend URL
- **"Invalid client"**: Verify Client ID is correct, application type is SPA
- **"Token verification failed"**: Verify AUTH0_DOMAIN is correct
- **Social login not working**: Verify social connections are enabled and OAuth apps configured

---

## ☁️ Cloudinary Setup

### Setup Cloudinary

1. **Create Account**
   - Go to [https://cloudinary.com](https://cloudinary.com)
   - Sign up for free account

2. **Get Credentials**
   - Go to Dashboard
   - Copy: Cloud Name, API Key, API Secret

3. **Add to Backend `.env`**
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### Cloudinary Features

- ✅ **Automatic Upload**: Images uploaded to Cloudinary on product creation
- ✅ **Image Optimization**: Automatic optimization and resizing
- ✅ **CDN Delivery**: Fast image loading
- ✅ **Automatic Cleanup**: Old images deleted when products are deleted/updated
- ✅ **Backward Compatibility**: Supports both Cloudinary URLs and local paths

---

## 🔒 Security Features

### Admin Security

1. **Enhanced Password Requirements** ✅
   - Minimum 8 characters
   - Requires 3 of 4 character types (uppercase, lowercase, numbers, special)
   - Password strength scoring (zxcvbn library)
   - Common password detection
   - Password history (last 5 passwords)
   - Increased bcrypt rounds (12 rounds)

2. **Account Lockout** ✅
   - Per-user account lockout (not just IP-based)
   - 5 failed attempts before lockout
   - 15-minute lockout period
   - Automatic unlock after expiration
   - Failed attempt tracking per user

3. **Refresh Token System** ✅
   - Short-lived access tokens (15 minutes)
   - Long-lived refresh tokens (7 days)
   - Token refresh endpoint
   - Separate refresh token secret

4. **Rate Limiting** ✅
   - IP-based rate limiting for login (5 attempts per 15 minutes)
   - General API rate limiting (100 requests per 15 minutes)
   - Admin operation rate limiting (50 requests per hour)
   - Uses express-rate-limit

5. **Security Headers** ✅
   - Helmet.js integration
   - Content Security Policy (CSP)
   - X-Frame-Options protection
   - X-Content-Type-Options protection
   - Strict-Transport-Security (HSTS) ready

6. **Login Tracking** ✅
   - Last login timestamp tracking
   - IP address logging
   - User agent tracking
   - Failed attempt logging

### Customer Security

- ✅ JWT token verification (JWKS)
- ✅ Secure token storage
- ✅ Token refresh support
- ✅ Guest checkout available
- ✅ Input validation (Mongoose schemas)
- ✅ Email validation
- ✅ CORS protection

### Recommended Future Enhancements

1. **Two-Factor Authentication (2FA)** - TOTP with Google Authenticator
2. **Login Attempt Logging** - Database logging of all attempts
3. **Session Management** - Track active sessions, concurrent session limits
4. **CSRF Protection** - CSRF tokens for state-changing operations
5. **Password Expiration** - Force password change after 90 days
6. **IP Whitelisting** - Restrict admin access to specific IPs (optional)

---

## 🐛 Bugs Fixed & Improvements

### Bugs Fixed

1. **Hardcoded Localhost URLs** ✅
   - Created `imageUtils.js` utility for dynamic URL handling
   - Supports both Cloudinary URLs and local paths

2. **Missing Error Handling for File Uploads** ✅
   - Added `handleMulterUpload` wrapper function
   - Proper error handling for file size, file type

3. **Missing Input Validation** ✅
   - Comprehensive Mongoose schema validation
   - Removed manual validation, using Mongoose validators

4. **Missing MongoDB ID Validation** ✅
   - Using `mongoose.Types.ObjectId.isValid()`
   - Centralized validation in utility functions

### Improvements Made

1. **Code Organization** ✅
   - Created utility functions for common operations
   - Reduced code redundancy
   - Better separation of concerns

2. **Error Handling** ✅
   - Centralized error handling
   - Consistent error messages
   - Mongoose validation error handling

3. **Validation** ✅
   - Mongoose schema validation (replaced regex)
   - Custom validators
   - Enum validation
   - Email validation

4. **Code Cleanup** ✅
   - Removed unused imports
   - Removed dead code
   - Removed debug console.logs
   - Fixed redundant code

---

## 🧹 Code Cleanup & Refactoring

### Utilities Created

1. **`backend/utils/validators.js`**
   - `isValidObjectId()` - Validate MongoDB IDs
   - `validateObjectId()` - Validate and throw error

2. **`backend/utils/errorHandler.js`**
   - `handleValidationError()` - Handle Mongoose validation errors
   - `handleError()` - Centralized error handling
   - `handleNotFound()` - Handle not found errors

3. **`backend/utils/productHelpers.js`**
   - `calculateDiscount()` - Calculate discount from prices
   - `calculateOriginalPrice()` - Calculate original price from discount
   - `processPriceAndDiscount()` - Process price and discount logic

### Refactoring Benefits

- ✅ **Reduced Code**: ~100+ lines of redundant code removed
- ✅ **Better Maintainability**: Centralized utilities
- ✅ **Consistency**: Unified error handling
- ✅ **Cleaner Routes**: Routes are now more readable
- ✅ **Reusability**: Utility functions can be reused

### Code Patterns Removed

- ❌ Repeated MongoDB ID validation (replaced with utility)
- ❌ Repeated error handling (replaced with utility)
- ❌ Repeated "not found" checks (replaced with utility)
- ❌ Repeated discount calculation (replaced with utility)
- ❌ Repeated user response formatting (replaced with helper)

---

## 📖 Learning Roadmap

### Phase 1: Frontend Basics (Week 1-2)

**Files to Study:**
- `frontend/src/main.jsx` - Entry point
- `frontend/src/App.jsx` - Main app component
- `frontend/src/pages/HomePage.jsx` - Simple page

**Learning Goals:**
- Understand React and JSX
- Understand component structure
- Understand React Router
- Understand `useState` and `useEffect`

### Phase 2: Backend Basics (Week 2-3)

**Files to Study:**
- `backend/server.js` - Server setup
- `backend/models/Product.js` - Database models
- `backend/routes/products.js` - API routes

**Learning Goals:**
- Understand Express
- Understand MongoDB and Mongoose
- Understand REST APIs
- Understand middleware

### Phase 3: Advanced Concepts (Week 3-4)

**Files to Study:**
- `frontend/src/Auth0Provider.jsx` - Authentication
- `backend/middleware/auth0.js` - Auth0 middleware
- `backend/utils/errorHandler.js` - Error handling

**Learning Goals:**
- Understand authentication
- Understand error handling
- Understand security
- Understand file uploads

---

## 🔌 API Endpoints

### Products

- `GET /api/products` - Get all products (public)
- `GET /api/products/:id` - Get single product (public)
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Orders

- `POST /api/orders` - Create order (public, supports guest)
- `GET /api/orders` - Get all orders (admin only)
- `GET /api/orders/:id` - Get single order (public)
- `PUT /api/orders/:id/status` - Update order status (admin only)

### Users (Auth0)

- `GET /api/users/me` - Get current user (requires Auth0 token)
- `PUT /api/users/me` - Update user profile (requires Auth0 token)
- `POST /api/users/sync` - Sync user from Auth0 (requires Auth0 token)
- `GET /api/users/me/orders` - Get user orders (requires Auth0 token)

### Auth (Admin)

- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Admin register
- `GET /api/auth/verify` - Verify admin token
- `POST /api/auth/refresh` - Refresh admin token

---

## 🔑 Environment Variables

### Backend (`.env`)

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/ecommerce

# Server
PORT=5000

# JWT Secret (Admin)
JWT_SECRET=your_jwt_secret_key_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Auth0
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_AUDIENCE=your_client_id

# Optional: Refresh Token Secret
JWT_REFRESH_SECRET=your_refresh_token_secret_here
```

### Frontend (`.env`)

```env
# API URL
VITE_API_URL=http://localhost:5000/api

# Auth0
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_AUDIENCE=your_client_id
VITE_AUTH0_REDIRECT_URI=http://localhost:3000/callback
```

---

## 📝 Database Schema

### Product Model

```javascript
{
  name: String (required, 1-200 chars),
  description: String (required, 10-2000 chars),
  price: Number (required, min: 0),
  originalPrice: Number (optional, min: 0),
  discount: Number (0-100),
  image: String,
  category: String (enum: General, Electronics, Clothing, Food),
  stock: Number (min: 0, integer),
  featured: Boolean,
  createdAt: Date
}
```

### Order Model

```javascript
{
  user: ObjectId (optional),
  customerName: String (required, 2-100 chars),
  customerEmail: String (optional, email validation),
  customerPhone: String (required, 10-20 chars),
  customerAddress: String (required, 10-500 chars),
  items: [{
    product: ObjectId,
    quantity: Number (min: 1, integer),
    price: Number (min: 0)
  }],
  totalAmount: Number (required, min: 0),
  paymentMethod: String (enum),
  status: String (enum: Pending, Confirmed, Out for Delivery, Delivered, Cancelled),
  createdAt: Date,
  updatedAt: Date
}
```

### User Model

```javascript
{
  auth0Id: String (unique, required),
  email: String (required, email validation),
  name: String (required),
  picture: String,
  provider: String (enum: google, facebook, auth0),
  phone: String,
  address: Object,
  orders: [ObjectId],
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date
}
```

---

## 🎓 Learning Resources

### React
- [React Official Docs](https://react.dev)
- [React Router Docs](https://reactrouter.com)
- [MDN JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

### Node.js/Express
- [Express Guide](https://expressjs.com/en/guide/routing.html)
- [Mongoose Docs](https://mongoosejs.com/docs/guide.html)
- [Node.js Docs](https://nodejs.org/en/docs)

### General
- [MDN Web Docs](https://developer.mozilla.org) - Best resource for web tech
- [JavaScript.info](https://javascript.info) - Comprehensive JS tutorial
- [freeCodeCamp](https://www.freecodecamp.org) - Free courses

---

## 📊 Project Structure

```
project/
├── backend/
│   ├── config/
│   │   └── cloudinary.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── auth0.js
│   │   └── security.js
│   ├── models/
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── User.js
│   │   └── Admin.js
│   ├── routes/
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── users.js
│   │   └── auth.js
│   ├── utils/
│   │   ├── validators.js
│   │   ├── errorHandler.js
│   │   ├── productHelpers.js
│   │   └── passwordValidator.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── ProductsPage.jsx
│   │   │   ├── ProductDetailPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   └── admin/
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── imageUtils.js
│   │   ├── App.jsx
│   │   └── Auth0Provider.jsx
│   └── package.json
└── DOCUMENTATION.md
```

---

## ✅ Checklist for New Developers

- [ ] Read this documentation
- [ ] Set up MongoDB
- [ ] Set up Auth0 account
- [ ] Set up Cloudinary account
- [ ] Configure environment variables
- [ ] Install dependencies
- [ ] Start backend server
- [ ] Start frontend server
- [ ] Test authentication
- [ ] Test product creation
- [ ] Test order placement

---

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check MongoDB is running
   - Verify MONGODB_URI is correct

2. **Auth0 Errors**
   - Check environment variables
   - Verify callback URLs in Auth0 dashboard
   - Check token expiration

3. **Cloudinary Errors**
   - Check Cloudinary credentials
   - Verify image file size (max 5MB)
   - Check file type (images only)

4. **CORS Errors**
   - Check CORS configuration in backend
   - Verify frontend URL in CORS settings

5. **Validation Errors**
   - Check Mongoose schema validation
   - Verify required fields
   - Check data types

---

## 🎯 Next Steps (Optional Enhancements)

1. **Email Notifications** - Send order confirmations via email
2. **Payment Integration** - Add payment gateway (Stripe, PayPal)
3. **Product Reviews** - Allow customers to review products
4. **Wishlist** - Allow users to save favorite products
5. **Search & Filters** - Enhanced product search and filtering
6. **Admin Dashboard** - Analytics and statistics
7. **Two-Factor Authentication** - 2FA for admin accounts
8. **Image Optimization** - Advanced image optimization
9. **Caching** - Redis caching for better performance
10. **Testing** - Unit tests and integration tests

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Check error logs
3. Verify environment variables
4. Check API responses
5. Review code in utilities and models

---

## 📄 License

This project is for educational purposes.

---

**Last Updated**: 2024
**Version**: 1.0.0

