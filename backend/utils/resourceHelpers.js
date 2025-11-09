const { handleNotFound } = require('./errorHandler');

/**
 * Find resource by ID and check if it exists
 * @param {Object} Model - Mongoose model
 * @param {string} id - Resource ID
 * @param {Object} res - Express response object
 * @param {string} resourceName - Name of the resource for error message
 * @param {Object} options - Additional options (populate, select, etc.)
 * @returns {Promise<Object|null>} - Resource object or null
 */
const findResourceById = async (Model, id, res, resourceName, options = {}) => {
  let query = Model.findById(id);
  
  if (options.populate) {
    query = query.populate(options.populate);
  }
  
  if (options.select) {
    query = query.select(options.select);
  }
  
  const resource = await query;
  
  if (!resource) {
    handleNotFound(res, resourceName);
    return null;
  }
  
  return resource;
};

module.exports = {
  findResourceById
};

