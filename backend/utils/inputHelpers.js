/**
 * Normalize boolean value from string or boolean
 * @param {string|boolean} value - Value to normalize
 * @returns {boolean} - Normalized boolean
 */
const normalizeBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value === 'true' || value === '1';
  }
  return false;
};

/**
 * Normalize username (trim and lowercase)
 * @param {string} username - Username to normalize
 * @returns {string} - Normalized username
 */
const normalizeUsername = (username) => {
  return username?.trim().toLowerCase() || '';
};

/**
 * Normalize password (trim)
 * @param {string} password - Password to normalize
 * @returns {string} - Normalized password
 */
const normalizePassword = (password) => {
  return password?.trim() || '';
};

module.exports = {
  normalizeBoolean,
  normalizeUsername,
  normalizePassword
};

