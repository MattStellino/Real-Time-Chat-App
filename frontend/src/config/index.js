// Configuration Management
import { PRODUCTION_CONFIG } from './production';
import { DEVELOPMENT_CONFIG } from './development';

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Export appropriate configuration
export const CONFIG = isProduction ? PRODUCTION_CONFIG : DEVELOPMENT_CONFIG;

// Environment-specific exports
export { PRODUCTION_CONFIG } from './production';
export { DEVELOPMENT_CONFIG } from './development';

// Utility functions
export const isProductionEnv = () => isProduction;
export const isDevelopmentEnv = () => isDevelopment;

// Log configuration on startup (only in development)
if (isDevelopment && CONFIG.ENABLE_DEBUG_LOGS) {
  console.log('🔧 Development Configuration Loaded:', {
    API_URL: CONFIG.API_URL,
    ENVIRONMENT: CONFIG.ENVIRONMENT,
    VERSION: CONFIG.VERSION,
    DEBUG_LOGS: CONFIG.ENABLE_DEBUG_LOGS
  });
}

// Default export
export default CONFIG;
