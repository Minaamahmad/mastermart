const zxcvbn = require('zxcvbn');

/**
 * Enhanced password validation
 * Returns validation result with score and feedback
 */
const validatePassword = (password) => {
  // Basic requirements
  if (!password) {
    return {
      valid: false,
      score: 0,
      message: 'Password is required',
      strength: 'weak'
    };
  }

  if (password.length < 8) {
    return {
      valid: false,
      score: 0,
      message: 'Password must be at least 8 characters long',
      strength: 'weak'
    };
  }

  if (password.length > 128) {
    return {
      valid: false,
      score: 0,
      message: 'Password must be less than 128 characters',
      strength: 'weak'
    };
  }

  // Check for common patterns
  const commonPasswords = [
    'password', '12345678', 'password123', 'admin123',
    'qwerty', 'abc123', 'letmein', 'welcome'
  ];
  
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    return {
      valid: false,
      score: 1,
      message: 'Password contains common words or patterns',
      strength: 'weak'
    };
  }

  // Use zxcvbn for password strength analysis
  const result = zxcvbn(password);
  const score = result.score; // 0-4 (0=weak, 4=very strong)
  
  // Minimum requirements
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const missingRequirements = [];
  if (!hasUpperCase) missingRequirements.push('uppercase letter');
  if (!hasLowerCase) missingRequirements.push('lowercase letter');
  if (!hasNumbers) missingRequirements.push('number');
  if (!hasSpecialChar) missingRequirements.push('special character');

  // Require at least 3 out of 4 character types
  if (missingRequirements.length > 1) {
    return {
      valid: false,
      score: score,
      message: `Password must contain at least 3 of: uppercase, lowercase, numbers, special characters. Missing: ${missingRequirements.join(', ')}`,
      strength: getStrengthLabel(score),
      feedback: result.feedback.suggestions
    };
  }

  // Require minimum score of 2 (fair strength)
  if (score < 2) {
    return {
      valid: false,
      score: score,
      message: 'Password is too weak. ' + (result.feedback.warning || 'Please use a stronger password.'),
      strength: getStrengthLabel(score),
      feedback: result.feedback.suggestions
    };
  }

  return {
    valid: true,
    score: score,
    message: 'Password is strong',
    strength: getStrengthLabel(score),
    feedback: result.feedback.suggestions
  };
};

const getStrengthLabel = (score) => {
  const labels = ['very weak', 'weak', 'fair', 'good', 'strong'];
  return labels[score] || 'weak';
};

/**
 * Check if password is similar to username
 */
const isPasswordSimilarToUsername = (password, username) => {
  if (!username || !password) return false;
  const passwordLower = password.toLowerCase();
  const usernameLower = username.toLowerCase();
  
  // Check if password contains username or vice versa
  if (passwordLower.includes(usernameLower) || usernameLower.includes(passwordLower)) {
    return true;
  }
  
  // Check for reversed username
  const reversedUsername = usernameLower.split('').reverse().join('');
  if (passwordLower.includes(reversedUsername)) {
    return true;
  }
  
  return false;
};

module.exports = {
  validatePassword,
  isPasswordSimilarToUsername,
  getStrengthLabel
};

