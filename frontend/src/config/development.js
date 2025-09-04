// Development Configuration
export const DEVELOPMENT_CONFIG = {
  API_URL: 'http://localhost:5000',
  SOCKET_URL: 'http://localhost:5000',
  ENVIRONMENT: 'development',
  VERSION: '1.0.0-dev',
  BUILD_DATE: new Date().toISOString().split('T')[0],
  
  // Feature flags
  ENABLE_DEBUG_LOGS: true,
  ENABLE_PERFORMANCE_MONITORING: false,
  ENABLE_ERROR_TRACKING: false,
  
  // API settings
  API_TIMEOUT: 10000,
  MAX_RETRY_ATTEMPTS: 1,
  
  // Socket settings
  SOCKET_RECONNECT_ATTEMPTS: 3,
  SOCKET_RECONNECT_DELAY: 500,
  
  // Notification settings
  NOTIFICATION_TIMEOUT: 10000,
  MAX_NOTIFICATIONS: 20,
  
  // File upload settings
  MAX_FILE_SIZE: 25 * 1024 * 1024, // 25MB for development
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'text/plain'],
  
  // Security settings
  SESSION_TIMEOUT: 7 * 24 * 60 * 60 * 1000, // 7 days for development
  PASSWORD_MIN_LENGTH: 6,
  
  // Performance settings
  MESSAGE_BATCH_SIZE: 25,
  CHAT_REFRESH_INTERVAL: 15000, // 15 seconds for development
  DEBOUNCE_DELAY: 100,
};
