/**
 * Handle Mongoose validation errors
 * @param {Error} error - The error object
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 400)
 * @returns {Object} - Error response
 */
const handleValidationError = (error, res, statusCode = 400) => {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(e => e.message);
    return res.status(statusCode).json({ message: errors.join(', ') });
  }
  return null;
};

/**
 * Handle errors and send appropriate response
 * @param {Error} error - The error object
 * @param {Object} res - Express response object
 * @param {number} defaultStatusCode - Default HTTP status code (default: 500)
 * @param {string} defaultMessage - Default error message
 */
const handleError = (error, res, defaultStatusCode = 500, defaultMessage = 'An error occurred') => {
  // Handle validation errors
  const validationError = handleValidationError(error, res, 400);
  if (validationError) return validationError;

  // Handle other errors
  const statusCode = error.statusCode || defaultStatusCode;
  const message = error.message || defaultMessage;
  
  return res.status(statusCode).json({ message });
};

/**
 * Handle not found errors
 * @param {Object} res - Express response object
 * @param {string} resource - Name of the resource (e.g., 'Product', 'Order')
 */
const handleNotFound = (res, resource = 'Resource') => {
  return res.status(404).json({ message: `${resource} not found` });
};

module.exports = {
  handleValidationError,
  handleError,
  handleNotFound
};

