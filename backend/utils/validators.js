const mongoose = require('mongoose');

/**
 * Validate MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Validate MongoDB ObjectId and throw error if invalid
 * @param {string} id - The ID to validate
 * @param {string} fieldName - Name of the field for error message
 * @throws {Error} - If ID is invalid
 */
const validateObjectId = (id, fieldName = 'ID') => {
  if (!isValidObjectId(id)) {
    throw new Error(`Invalid ${fieldName} format`);
  }
};

module.exports = {
  isValidObjectId,
  validateObjectId
};

