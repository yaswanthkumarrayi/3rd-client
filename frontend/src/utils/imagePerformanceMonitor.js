/**
 * Image Performance Monitor - Tracks and reports image loading performance
 * Use this to measure the effectiveness of FastImage optimizations
 */

class ImagePerformanceMonitor {
  constructor() {
    this.loadTimes = [];
    this.errorCount = 0;
    this.totalImages = 0;
    this.fastestLoad = Infinity;
    this.slowestLoad = 0;
    this.startTime = Date.now();
  }

  trackImageStart(src) {
    this.totalImages++;
    const startTime = Date.now();
    
    return {
      imageUrl: src,
      startTime,
      complete: (success = true) => {
        const loadTime = Date.now() - startTime;
        
        if (success) {
          this.loadTimes.push(loadTime);
          this.fastestLoad = Math.min(this.fastestLoad, loadTime);
          this.slowestLoad = Math.max(this.slowestLoad, loadTime);
        } else {
          this.errorCount++;
        }
        
        // Log ultrafast loads (under 100ms)
        if (success && loadTime < 100) {
          console.log(`⚡ Ultra-fast image load: ${loadTime}ms - ${src.substring(0, 50)}...`);
        }
      }
    };
  }

  getPerformanceReport() {
    const avgLoadTime = this.loadTimes.length > 0 
      ? (this.loadTimes.reduce((a, b) => a + b, 0) / this.loadTimes.length).toFixed(2)
      : 0;
    
    const successRate = this.totalImages > 0 
      ? (((this.totalImages - this.errorCount) / this.totalImages) * 100).toFixed(2)
      : 0;

    const ultraFastCount = this.loadTimes.filter(time => time < 100).length;
    const fastCount = this.loadTimes.filter(time => time < 200).length;

    return {
      totalImages: this.totalImages,
      averageLoadTime: `${avgLoadTime}ms`,
      fastestLoad: this.fastestLoad === Infinity ? 0 : `${this.fastestLoad}ms`,
      slowestLoad: `${this.slowestLoad}ms`,
      successRate: `${successRate}%`,
      errorCount: this.errorCount,
      ultraFastLoads: ultraFastCount, // Under 100ms
      fastLoads: fastCount, // Under 200ms
      sessionDuration: `${((Date.now() - this.startTime) / 1000).toFixed(1)}s`
    };
  }

  logPerformanceReport() {
    const report = this.getPerformanceReport();
    console.group('🖼️ Image Performance Report');
    console.log('📊 Total Images Loaded:', report.totalImages);
    console.log('⚡ Ultra-Fast Loads (<100ms):', report.ultraFastLoads);
    console.log('🚀 Fast Loads (<200ms):', report.fastLoads);
    console.log('📈 Average Load Time:', report.averageLoadTime);
    console.log('🏃 Fastest Load:', report.fastestLoad);
    console.log('🐌 Slowest Load:', report.slowestLoad);
    console.log('✅ Success Rate:', report.successRate);
    console.log('❌ Error Count:', report.errorCount);
    console.log('⏱️ Session Duration:', report.sessionDuration);
    console.groupEnd();
    
    return report;
  }

  // Auto-log report every 30 seconds during development
  startAutoReporting() {
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        if (this.totalImages > 0) {
          this.logPerformanceReport();
        }
      }, 30000);
    }
  }
}

// Global instance for tracking across the app
export const imagePerformanceMonitor = new ImagePerformanceMonitor();

// Start auto-reporting in development
if (typeof window !== 'undefined') {
  imagePerformanceMonitor.startAutoReporting();
}

export default ImagePerformanceMonitor;