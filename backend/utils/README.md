# Backend Utilities Documentation

This directory contains reusable utility functions that help keep the codebase DRY (Don't Repeat Yourself) and maintainable.

## Why These Files Exist

Before these utilities were created, the same code was repeated multiple times across different route files. This made the code:
- Harder to maintain (fix bugs in multiple places)
- More error-prone (copy-paste mistakes)
- Harder to test
- Less readable

Now, all common functionality is centralized in these utility files.

---

## Utility Files

### 1. `jwtHelpers.js` - JWT Token Operations
**Purpose**: Handles all JWT token generation and verification

**Functions**:
- `generateAccessToken(payload, expiresIn)` - Creates a short-lived access token (15min)
- `generateRefreshToken(payload, expiresIn)` - Creates a long-lived refresh token (7 days)
- `generateTokens(payload)` - Creates both tokens at once
- `verifyAccessToken(token)` - Verifies an access token
- `verifyRefreshToken(token)` - Verifies a refresh token

**Used in**:
- `backend/routes/auth.js` - For admin login, registration, token refresh
- `backend/middleware/auth.js` - For verifying admin tokens

**Before**: JWT code was duplicated 3 times in `auth.js`  
**After**: One centralized location for all JWT operations

---

### 2. `userHelpers.js` - User Database Operations
**Purpose**: Common user lookup functions

**Functions**:
- `findUserByAuth0Id(auth0Id)` - Finds a user by their Auth0 ID

**Used in**:
- `backend/routes/users.js` - Getting/updating user profile
- `backend/routes/orders.js` - Finding user when creating orders

**Before**: `User.findOne({ auth0Id: req.user.sub })` was repeated 4 times  
**After**: One reusable function

---

### 3. `inputHelpers.js` - Input Normalization
**Purpose**: Normalizes and cleans user input

**Functions**:
- `normalizeBoolean(value)` - Converts "true"/"false" strings to actual booleans
- `normalizeUsername(username)` - Trims and lowercases usernames
- `normalizePassword(password)` - Trims passwords

**Used in**:
- `backend/routes/auth.js` - Normalizing login/registration input
- `backend/routes/products.js` - Normalizing featured product flag

**Before**: `featured === 'true' || featured === true` was repeated  
**Before**: `username.trim().toLowerCase()` was repeated  
**After**: Clean, reusable functions

---

### 4. `cloudinaryHelpers.js` - Cloudinary Image Operations
**Purpose**: Handles Cloudinary image deletion

**Functions**:
- `extractPublicId(url)` - Extracts the public ID from a Cloudinary URL
- `deleteCloudinaryImage(imageUrl)` - Deletes an image from Cloudinary

**Used in**:
- `backend/routes/products.js` - Deleting product images when updating/deleting products

**Before**: These functions were defined inside `products.js`  
**After**: Reusable utilities that could be used elsewhere if needed

---

### 5. `validateId.js` (Middleware) - ID Validation
**Purpose**: Validates MongoDB ObjectId format in route parameters

**Usage**:
```javascript
router.get('/:id', validateId('id'), async (req, res) => {
  // ID is guaranteed to be valid here
});
```

**Used in**:
- `backend/routes/products.js` - Validating product IDs
- `backend/routes/orders.js` - Validating order IDs

**Before**: `if (!isValidObjectId(req.params.id)) { return res.status(400)... }` was repeated 5 times  
**After**: One middleware that can be added to any route

---

### 6. `errorHandler.js` - Error Handling
**Purpose**: Centralized error handling for API responses

**Functions**:
- `handleError(error, res, statusCode, message)` - Handles errors consistently
- `handleNotFound(res, resourceName)` - Returns 404 for missing resources

**Used in**: All route files

---

### 7. `validators.js` - Validation Functions
**Purpose**: Common validation functions

**Functions**:
- `isValidObjectId(id)` - Checks if a string is a valid MongoDB ObjectId

**Used in**: Routes and middleware

---

### 8. `productHelpers.js` - Product-Specific Logic
**Purpose**: Product business logic (price/discount calculations)

**Functions**:
- `processPriceAndDiscount(price, originalPrice, discount)` - Calculates final price and discount

**Used in**: `backend/routes/products.js`

---

### 9. `resourceHelpers.js` - Resource Operations
**Purpose**: Common database resource operations (currently unused but ready for future use)

**Functions**:
- `findResourceById(Model, id, res, resourceName, options)` - Finds a resource and handles not found

---

## Benefits of This Approach

1. **DRY Principle**: Code is written once, used everywhere
2. **Maintainability**: Fix bugs in one place
3. **Consistency**: Same logic everywhere
4. **Testability**: Easy to test utility functions
5. **Readability**: Routes are cleaner and easier to understand

## Example: Before vs After

### Before (Duplicated Code):
```javascript
// In auth.js - Login
const accessToken = jwt.sign(
  { id: admin._id, username: admin.username },
  process.env.JWT_SECRET || 'your_secret_key_here_change_in_production',
  { expiresIn: '15m' }
);

// In auth.js - Registration (same code repeated)
const accessToken = jwt.sign(
  { id: admin._id, username: admin.username },
  process.env.JWT_SECRET || 'your_secret_key_here_change_in_production',
  { expiresIn: '15m' }
);
```

### After (Using Utility):
```javascript
// In auth.js - Login
const { accessToken, refreshToken } = generateTokens({ 
  id: admin._id, 
  username: admin.username 
});

// In auth.js - Registration (same function)
const { accessToken, refreshToken } = generateTokens({ 
  id: admin._id, 
  username: admin.username 
});
```

Much cleaner! 🎉

