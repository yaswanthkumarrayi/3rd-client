/**
 * Performance Monitoring Component
 * Tracks and reports website performance metrics
 */

import React, { useEffect, useState } from 'react';

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  IMAGE_LOAD: 2000,     // 2 seconds
  PAGE_LOAD: 3000,      // 3 seconds
  API_RESPONSE: 1000,   // 1 second
};

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    imageLoads: [],
    apiCalls: [],
    pageLoadTime: null,
    totalImages: 0,
    loadedImages: 0,
    failedImages: 0,
  });

  useEffect(() => {
    // Track page load time
    const startTime = performance.timeOrigin;
    
    const handleLoad = () => {
      const loadTime = Date.now() - startTime;
      setMetrics(prev => ({
        ...prev,
        pageLoadTime: loadTime
      }));
      
      if (loadTime > PERFORMANCE_THRESHOLDS.PAGE_LOAD) {
        console.warn(`🐌 Slow page load: ${loadTime}ms`);
      } else {
        console.log(`⚡ Fast page load: ${loadTime}ms`);
      }
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => window.removeEventListener('load', handleLoad);
  }, []);

  const trackImageLoad = (imageUrl, loadTime) => {
    setMetrics(prev => ({
      ...prev,
      imageLoads: [...prev.imageLoads, { url: imageUrl, loadTime, timestamp: Date.now() }],
      loadedImages: prev.loadedImages + 1
    }));

    if (loadTime > PERFORMANCE_THRESHOLDS.IMAGE_LOAD) {
      console.warn(`🖼️ Slow image load: ${imageUrl} took ${loadTime}ms`);
    }
  };

  const trackImageError = (imageUrl) => {
    setMetrics(prev => ({
      ...prev,
      failedImages: prev.failedImages + 1
    }));
    console.error(`❌ Failed to load image: ${imageUrl}`);
  };

  const trackApiCall = (endpoint, responseTime) => {
    setMetrics(prev => ({
      ...prev,
      apiCalls: [...prev.apiCalls, { endpoint, responseTime, timestamp: Date.now() }]
    }));

    if (responseTime > PERFORMANCE_THRESHOLDS.API_RESPONSE) {
      console.warn(`🐌 Slow API call: ${endpoint} took ${responseTime}ms`);
    }
  };

  const getPerformanceReport = () => {
    const avgImageLoad = metrics.imageLoads.length > 0
      ? metrics.imageLoads.reduce((sum, img) => sum + img.loadTime, 0) / metrics.imageLoads.length
      : 0;

    const avgApiResponse = metrics.apiCalls.length > 0
      ? metrics.apiCalls.reduce((sum, call) => sum + call.responseTime, 0) / metrics.apiCalls.length
      : 0;

    return {
      pageLoadTime: metrics.pageLoadTime,
      averageImageLoadTime: Math.round(avgImageLoad),
      averageApiResponseTime: Math.round(avgApiResponse),
      totalImages: metrics.totalImages,
      loadedImages: metrics.loadedImages,
      failedImages: metrics.failedImages,
      imageSuccessRate: metrics.totalImages > 0 
        ? Math.round((metrics.loadedImages / metrics.totalImages) * 100) 
        : 100,
      slowImages: metrics.imageLoads.filter(img => img.loadTime > PERFORMANCE_THRESHOLDS.IMAGE_LOAD).length,
      slowApiCalls: metrics.apiCalls.filter(call => call.responseTime > PERFORMANCE_THRESHOLDS.API_RESPONSE).length,
    };
  };

  return {
    metrics,
    trackImageLoad,
    trackImageError,
    trackApiCall,
    getPerformanceReport,
  };
}

/**
 * Performance dashboard component (for development)
 */
export function PerformanceDashboard({ show = false }) {
  const { getPerformanceReport } = usePerformanceMonitor();
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (show) {
      const interval = setInterval(() => {
        setReport(getPerformanceReport());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [show]);

  if (!show || !report) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-xs z-50 max-w-sm">
      <h3 className="font-bold text-gray-900 mb-2">Performance Monitor</h3>
      <div className="space-y-1 text-gray-700">
        <div>Page Load: {report.pageLoadTime ? `${report.pageLoadTime}ms` : 'Loading...'}</div>
        <div>Avg Image Load: {report.averageImageLoadTime}ms</div>
        <div>Avg API Response: {report.averageApiResponseTime}ms</div>
        <div>Images: {report.loadedImages}/{report.totalImages} ({report.imageSuccessRate}%)</div>
        {report.slowImages > 0 && (
          <div className="text-orange-600">⚠️ {report.slowImages} slow images</div>
        )}
        {report.slowApiCalls > 0 && (
          <div className="text-orange-600">⚠️ {report.slowApiCalls} slow API calls</div>
        )}
        {report.failedImages > 0 && (
          <div className="text-red-600">❌ {report.failedImages} failed images</div>
        )}
      </div>
    </div>
  );
}

/**
 * Web Vitals tracking
 */
export function trackWebVitals() {
  // Track Core Web Vitals if available
  if ('web-vital' in window) {
    try {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    } catch (error) {
      console.log('Web Vitals not available');
    }
  }
}

/**
 * Image performance helper
 */
export function createImagePerformanceTracker() {
  const loadTimes = new Map();
  
  const trackImageStart = (src) => {
    loadTimes.set(src, Date.now());
  };
  
  const trackImageEnd = (src) => {
    const startTime = loadTimes.get(src);
    if (startTime) {
      const loadTime = Date.now() - startTime;
      loadTimes.delete(src);
      
      // Log performance
      if (loadTime > PERFORMANCE_THRESHOLDS.IMAGE_LOAD) {
        console.warn(`🐌 Slow image: ${src} (${loadTime}ms)`);
      } else if (loadTime < 500) {
        console.log(`⚡ Fast image: ${src} (${loadTime}ms)`);
      }
      
      return loadTime;
    }
    return 0;
  };
  
  return { trackImageStart, trackImageEnd };
}