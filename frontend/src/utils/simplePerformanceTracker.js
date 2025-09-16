/**
 * Simple Performance Tracker (No React dependencies)
 * Lightweight performance monitoring for images and API calls
 */

// Simple performance thresholds
const THRESHOLDS = {
  IMAGE_LOAD: 2000,
  API_RESPONSE: 1000,
};

// Performance tracking functions
export const simplePerformanceTracker = {
  trackImageLoad: (src, loadTime) => {
    if (loadTime > THRESHOLDS.IMAGE_LOAD) {
      console.warn(`🐌 Slow image: ${src} (${loadTime}ms)`);
    } else if (loadTime < 500) {
      console.log(`⚡ Fast image loaded (${loadTime}ms)`);
    }
  },

  trackApiCall: (endpoint, responseTime) => {
    if (responseTime > THRESHOLDS.API_RESPONSE) {
      console.warn(`🐌 Slow API: ${endpoint} (${responseTime}ms)`);
    } else {
      console.log(`📊 API ${endpoint}: ${responseTime}ms`);
    }
  },

  trackImageError: (src) => {
    console.error(`❌ Failed to load: ${src}`);
  },

  // Start/end timing utility
  startTimer: (key) => {
    if (typeof window !== 'undefined') {
      window.performanceTimers = window.performanceTimers || {};
      window.performanceTimers[key] = Date.now();
    }
  },

  endTimer: (key) => {
    if (typeof window !== 'undefined' && window.performanceTimers && window.performanceTimers[key]) {
      const duration = Date.now() - window.performanceTimers[key];
      delete window.performanceTimers[key];
      return duration;
    }
    return 0;
  }
};

// Image load tracking helper
export const createImageTracker = () => {
  const loadTimes = new Map();
  
  return {
    onLoadStart: (src) => {
      loadTimes.set(src, Date.now());
    },
    
    onLoadEnd: (src) => {
      const startTime = loadTimes.get(src);
      if (startTime) {
        const duration = Date.now() - startTime;
        loadTimes.delete(src);
        simplePerformanceTracker.trackImageLoad(src, duration);
        return duration;
      }
      return 0;
    },
    
    onError: (src) => {
      loadTimes.delete(src);
      simplePerformanceTracker.trackImageError(src);
    }
  };
};