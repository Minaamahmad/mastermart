const { isValidObjectId } = require('../utils/validators');

/**
 * Middleware to validate MongoDB ObjectId in route parameters
 * @param {string} paramName - Name of the parameter (default: 'id')
 * @returns {Function} - Express middleware
 */
const validateId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id) {
      return res.status(400).json({ message: `${paramName} parameter is required` });
    }
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: `Invalid ${paramName} format` });
    }
    
    next();
  };
};

module.exports = validateId;

