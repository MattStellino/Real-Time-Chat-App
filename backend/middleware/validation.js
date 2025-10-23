// Validation middleware for authentication and security
const validator = require('validator');

// Password strength validation
const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common weak passwords
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a stronger password');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Email validation
const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!validator.isEmail(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  if (email.length > 254) {
    return { isValid: false, error: 'Email is too long' };
  }
  
  return { isValid: true };
};

// Username validation
const validateUsername = (username) => {
  const errors = [];
  
  if (!username) {
    errors.push('Username is required');
    return { isValid: false, errors };
  }
  
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (username.length > 30) {
    errors.push('Username must be less than 30 characters');
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }
  
  if (/^[_-]/.test(username) || /[_-]$/.test(username)) {
    errors.push('Username cannot start or end with underscore or hyphen');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Input sanitization
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};

// Registration validation middleware
const validateRegistration = (req, res, next) => {
  const { username, email, password } = req.body;
  
  // Sanitize inputs
  req.body.username = sanitizeInput(username);
  req.body.email = sanitizeInput(email);
  
  // Validate email
  const emailValidation = validateEmail(req.body.email);
  if (!emailValidation.isValid) {
    return res.status(400).json({
      success: false,
      error: emailValidation.error,
      field: 'email'
    });
  }
  
  // Validate username
  const usernameValidation = validateUsername(req.body.username);
  if (!usernameValidation.isValid) {
    return res.status(400).json({
      success: false,
      error: usernameValidation.errors[0],
      field: 'username'
    });
  }
  
  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({
      success: false,
      error: passwordValidation.errors[0],
      field: 'password'
    });
  }
  
  next();
};

// Login validation middleware
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }
  
  // Sanitize email
  req.body.email = sanitizeInput(email);
  
  // Validate email format
  const emailValidation = validateEmail(req.body.email);
  if (!emailValidation.isValid) {
    return res.status(400).json({
      success: false,
      error: 'Please enter a valid email address'
    });
  }
  
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validatePassword,
  validateEmail,
  validateUsername,
  sanitizeInput
};
