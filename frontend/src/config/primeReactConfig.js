// PrimeReact Configuration
export const PRIME_CONFIG = {
  // Theme configuration
  theme: 'lara-light-blue',
  
  // Component defaults
  ripple: true,
  inputStyle: 'outlined',
  
  // Z-index management
  zIndex: {
    modal: 1000,
    overlay: 1000,
    tooltip: 1100,
    toast: 1200
  },
  
  // Animation settings
  animation: {
    duration: 150,
    easing: 'ease-out'
  },
  
  // Locale settings
  locale: 'en',
  
  // Auto Z-index management
  autoZIndex: true
};

// PrimeFlex utility classes mapping
export const PRIMEFLEX_UTILITIES = {
  // Layout
  container: 'p-container',
  fluid: 'p-fluid',
  
  // Spacing
  padding: {
    none: 'p-0',
    small: 'p-2',
    medium: 'p-3',
    large: 'p-4'
  },
  margin: {
    none: 'm-0',
    small: 'm-2',
    medium: 'm-3',
    large: 'm-4'
  },
  
  // Flexbox
  flex: {
    center: 'flex align-items-center justify-content-center',
    between: 'flex align-items-center justify-content-between',
    start: 'flex align-items-center justify-content-start',
    end: 'flex align-items-center justify-content-end'
  },
  
  // Grid
  grid: {
    row: 'flex flex-row',
    column: 'flex flex-column',
    wrap: 'flex flex-wrap'
  }
};
