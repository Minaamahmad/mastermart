const User = require('../models/User');

/**
 * Find user by Auth0 ID
 * @param {string} auth0Id - Auth0 user ID
 * @returns {Promise<Object|null>} - User object or null
 */
const findUserByAuth0Id = async (auth0Id) => {
  return await User.findOne({ auth0Id });
};

module.exports = {
  findUserByAuth0Id
};

