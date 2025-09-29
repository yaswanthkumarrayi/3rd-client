/**
 * Quick Test Script to Verify Ultra-Fast Image Loading
 * 
 * Run this in browser console on any page to test the FastImage performance
 * 
 * Usage:
 * 1. Open browser console (F12)
 * 2. Paste this code and run it
 * 3. Check the performance report
 */

// Test FastImage performance
function testImageLoadingPerformance() {
  console.log('🧪 Testing FastImage Performance...');
  
  // Get performance report
  setTimeout(() => {
    if (window.imagePerformanceMonitor) {
      const report = window.imagePerformanceMonitor.getPerformanceReport();
      
      console.group('🚀 FastImage Performance Test Results');
      console.log('📊 Total Images:', report.totalImages);
      console.log('⚡ Ultra-Fast Loads (<100ms):', report.ultraFastLoads);
      console.log('🚀 Fast Loads (<200ms):', report.fastLoads);
      console.log('📈 Average Load Time:', report.averageLoadTime);
      console.log('🏃 Fastest Load:', report.fastestLoad);
      console.log('✅ Success Rate:', report.successRate);
      
      // Performance Grade
      const avgTime = parseFloat(report.averageLoadTime);
      let grade = 'F';
      if (avgTime < 50) grade = 'A++';
      else if (avgTime < 100) grade = 'A';
      else if (avgTime < 200) grade = 'B';
      else if (avgTime < 300) grade = 'C';
      else if (avgTime < 500) grade = 'D';
      
      console.log(`🎯 Performance Grade: ${grade}`);
      
      if (grade.includes('A')) {
        console.log('🎉 Excellent! Ultra-fast loading achieved!');
      } else if (grade === 'B') {
        console.log('👍 Good performance, images loading quickly!');
      } else {
        console.log('⚠️ Performance could be improved. Check network conditions.');
      }
      
      console.groupEnd();
      
      return report;
    } else {
      console.log('❌ Performance monitor not found. Make sure FastImage is loaded.');
    }
  }, 3000);
}

// Expose to global scope for easy testing
window.testImagePerformance = testImageLoadingPerformance;

console.log('🧪 Image Performance Test Loaded!');
console.log('👉 Run: testImagePerformance() to check performance');

// Auto-run test after page loads
if (document.readyState === 'complete') {
  setTimeout(testImageLoadingPerformance, 2000);
} else {
  window.addEventListener('load', () => {
    setTimeout(testImageLoadingPerformance, 2000);
  });
}