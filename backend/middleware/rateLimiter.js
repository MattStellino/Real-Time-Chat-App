// Advanced rate limiting middleware for authentication endpoints
const rateLimit = require('express-rate-limit');

// Store for tracking failed login attempts
const failedAttempts = new Map();
const accountLockouts = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  
  // Clean failed attempts older than 15 minutes
  for (const [key, data] of failedAttempts.entries()) {
    if (now - data.lastAttempt > 15 * 60 * 1000) {
      failedAttempts.delete(key);
    }
  }
  
  // Clean account lockouts older than 30 minutes
  for (const [key, data] of accountLockouts.entries()) {
    if (now - data.lockedUntil < now) {
      accountLockouts.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Get client identifier (IP + User-Agent for better tracking)
const getClientId = (req) => {
  const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  const userAgent = req.get('User-Agent') || '';
  return `${ip}-${userAgent.substring(0, 50)}`;
};

// Check if account is locked
const isAccountLocked = (email) => {
  const lockout = accountLockouts.get(email);
  if (lockout && lockout.lockedUntil > Date.now()) {
    return {
      isLocked: true,
      lockedUntil: lockout.lockedUntil,
      attempts: lockout.attempts
    };
  }
  return { isLocked: false };
};

// Record failed login attempt
const recordFailedAttempt = (email, clientId) => {
  const now = Date.now();
  
  // Track by email
  if (!failedAttempts.has(email)) {
    failedAttempts.set(email, { count: 0, lastAttempt: now, clientIds: new Set() });
  }
  
  const emailData = failedAttempts.get(email);
  emailData.count++;
  emailData.lastAttempt = now;
  emailData.clientIds.add(clientId);
  
  // Lock account after 5 failed attempts
  if (emailData.count >= 5) {
    const lockoutDuration = Math.min(30 * 60 * 1000, emailData.count * 5 * 60 * 1000); // Max 30 minutes
    accountLockouts.set(email, {
      lockedUntil: now + lockoutDuration,
      attempts: emailData.count
    });
    
    // Clear failed attempts for this email
    failedAttempts.delete(email);
  }
  
  return emailData.count;
};

// Clear failed attempts on successful login
const clearFailedAttempts = (email) => {
  failedAttempts.delete(email);
  accountLockouts.delete(email);
};

// Registration rate limiter (more lenient)
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 registration attempts per 15 minutes per IP
  message: {
    success: false,
    error: 'Too many registration attempts. Please try again in 15 minutes.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientId,
  skip: (req) => {
    // Skip rate limiting for successful registrations
    return false;
  }
});

// Login rate limiter (stricter)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per 15 minutes per IP
  message: {
    success: false,
    error: 'Too many login attempts. Please try again in 15 minutes.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientId,
  skip: (req) => {
    // Skip rate limiting for successful logins
    return false;
  }
});

// Enhanced login middleware with account lockout
const enhancedLoginLimiter = (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return next();
  }
  
  // Check if account is locked
  const lockoutStatus = isAccountLocked(email);
  if (lockoutStatus.isLocked) {
    const remainingTime = Math.ceil((lockoutStatus.lockedUntil - Date.now()) / 1000 / 60);
    return res.status(429).json({
      success: false,
      error: `Account temporarily locked due to too many failed attempts. Try again in ${remainingTime} minutes.`,
      retryAfter: remainingTime * 60,
      lockedUntil: lockoutStatus.lockedUntil
    });
  }
  
  // Apply standard rate limiting
  loginLimiter(req, res, (err) => {
    if (err) {
      return res.status(429).json(err);
    }
    next();
  });
};

// Password reset rate limiter
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  message: {
    success: false,
    error: 'Too many password reset attempts. Please try again in 1 hour.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientId
});

module.exports = {
  registrationLimiter,
  enhancedLoginLimiter,
  passwordResetLimiter,
  recordFailedAttempt,
  clearFailedAttempts,
  isAccountLocked,
  getClientId
};
