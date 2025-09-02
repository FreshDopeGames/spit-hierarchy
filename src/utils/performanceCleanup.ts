// Performance cleanup utility to remove console logs and optimize for production
import { handleError } from './errorHandler';

// Remove all console.log statements in production builds
export const initializePerformanceOptimizations = () => {
  // Only in production, disable console logs
  if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
    console.info = () => {};
    console.warn = (...args) => {
      // Keep warnings in production for debugging
      if (args.length > 0 && typeof args[0] === 'string' && args[0].includes('critical')) {
        // Only show critical warnings
        return;
      }
    };
  }
};

// Theme loading performance monitoring
export const monitorThemePerformance = () => {
  const startTime = performance.now();
  
  return {
    end: (context: string) => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > 100) {
        handleError(
          new Error(`Theme loading took ${duration.toFixed(2)}ms in ${context}`),
          'theme-performance'
        );
      }
    }
  };
};

// CSS loading detection
export const waitForCSSLoad = (): Promise<void> => {
  return new Promise((resolve) => {
    // Check if CSS custom properties are available
    const checkCSSLoaded = () => {
      const testElement = document.createElement('div');
      testElement.style.setProperty('--test-prop', 'test');
      document.body.appendChild(testElement);
      
      const computedStyle = getComputedStyle(testElement);
      const hasCSS = computedStyle.getPropertyValue('--theme-primary') !== '';
      
      document.body.removeChild(testElement);
      
      if (hasCSS) {
        resolve();
      } else {
        setTimeout(checkCSSLoaded, 10);
      }
    };
    
    checkCSSLoaded();
  });
};

// Initialize performance optimizations on app start
initializePerformanceOptimizations();
