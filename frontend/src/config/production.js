// Production Configuration
export const PRODUCTION_CONFIG = {
  API_URL: process.env.REACT_APP_API_URL || 'https://your-backend-url.vercel.app',
  SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'https://your-backend-url.vercel.app',
  ENVIRONMENT: 'production',
  VERSION: '1.0.0',
  BUILD_DATE: '2025-01-02',
  
  // Feature flags
  ENABLE_DEBUG_LOGS: false,
  ENABLE_PERFORMANCE_MONITORING: true,
  ENABLE_ERROR_TRACKING: true,
  
  // API settings
  API_TIMEOUT: 30000,
  MAX_RETRY_ATTEMPTS: 3,
  
  // Socket settings
  SOCKET_RECONNECT_ATTEMPTS: 5,
  SOCKET_RECONNECT_DELAY: 1000,
  
  // Notification settings
  NOTIFICATION_TIMEOUT: 5000,
  MAX_NOTIFICATIONS: 10,
  
  // File upload settings
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  
  // Security settings
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_MIN_LENGTH: 8,
  
  // Performance settings
  MESSAGE_BATCH_SIZE: 50,
  CHAT_REFRESH_INTERVAL: 30000, // 30 seconds
  DEBOUNCE_DELAY: 300,
};
