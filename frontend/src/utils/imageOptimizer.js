/**
 * Image optimization utility for Supabase transformations
 * Applies ?width=400&quality=70&format=webp for fast loading
 */

import React from 'react';

// Default optimization parameters for fast loading
const DEFAULT_TRANSFORMATIONS = {
  width: 300,
  quality: 50,
  format: 'webp'
};

// Different sizes for different use cases - HEAVILY OPTIMIZED FOR SPEED
// Thumbnail: 150px, 45% quality, WebP - optimized for MAX 100KB for ultra-fast loading
// Card: 200px, 50% quality, WebP - for home page cards 
// Hero: 600px, 65% quality, WebP - for hero sections
// Product: 400px, 60% quality, WebP - optimized for fast product page loading
// ProductHigh: 800px, 75% quality, WebP - highest quality for product details
// Category: 250px, 55% quality, WebP - for category images
const IMAGE_SIZES = {
  blur: { width: 100, quality: 20, format: 'webp' }, // Ultra-fast blur version for instant display
  thumbnail: { width: 150, quality: 45, format: 'webp' }, // Optimized for MAX 100KB
  card: { width: 200, quality: 50, format: 'webp' }, // For home page cards
  hero: { width: 600, quality: 65, format: 'webp' },
  product: { width: 400, quality: 60, format: 'webp' }, // Fast loading for product page
  productHigh: { width: 800, quality: 75, format: 'webp' }, // Highest quality for product details
  category: { width: 250, quality: 55, format: 'webp' }
};

/**
 * Optimizes image URL with Supabase transformations
 * @param {string} imageUrl - Original image URL
 * @param {string} size - Size preset (thumbnail, card, hero, product, productHigh, category)
 * @param {object} customParams - Custom transformation parameters
 * @returns {string} Optimized image URL
 */
export function optimizeImage(imageUrl, size = 'card', customParams = {}) {
  if (!imageUrl) return '';
  
  // If it's already a local image (fallback), return as-is
  if (!imageUrl.includes('http') && !imageUrl.includes('supabase')) {
    return imageUrl;
  }
  
  // Check if it's a Supabase URL that supports transformations
  if (!imageUrl.includes('supabase.co') && !imageUrl.includes('supabase.com')) {
    return imageUrl;
  }
  
  // Get size preset or use default
  const sizeConfig = IMAGE_SIZES[size] || DEFAULT_TRANSFORMATIONS;
  
  // Merge with custom parameters
  const params = { ...sizeConfig, ...customParams };
  
  // Build query string
  const queryParams = new URLSearchParams(params).toString();
  
  // Add transformations to Supabase URL
  const separator = imageUrl.includes('?') ? '&' : '?';
  const optimizedUrl = `${imageUrl}${separator}${queryParams}`;
  
  return optimizedUrl;
}

/**
 * Get super-fast loading thumbnail for ultra performance (max 50KB)
 * @param {string} imageUrl - Original image URL
 * @returns {string} Ultra-fast thumbnail URL
 */
export function getUltraFastThumbnail(imageUrl) {
  return optimizeImage(imageUrl, 'thumbnail', { width: 120, quality: 35 });
}

/**
 * Get ultra-fast blur version of image for instant display (max 20KB)
 * @param {string} imageUrl - Original image URL
 * @returns {string} Ultra-fast blur image URL
 */
export function getBlurVersion(imageUrl) {
  return optimizeImage(imageUrl, 'blur');
}

/**
 * Get optimized thumbnail for ultra-fast loading (max 100KB)
 * @param {string} imageUrl - Original image URL
 * @returns {string} Optimized thumbnail URL
 */
export function getThumbnail(imageUrl) {
  return optimizeImage(imageUrl, 'thumbnail');
}

/**
 * Get full quality image for product details
 * @param {string} imageUrl - Original image URL
 * @returns {string} High quality image URL
 */
export function getFullQualityImage(imageUrl) {
  return optimizeImage(imageUrl, 'productHigh');
}

/**
 * Creates an enhanced blur placeholder data URL with realistic colors
 * @param {number} width - Placeholder width
 * @param {number} height - Placeholder height
 * @param {string} colorScheme - Color scheme: 'light', 'warm', 'cool', 'product'
 * @returns {string} Data URL for blur placeholder
 */
export function createBlurPlaceholder(width = 40, height = 40, colorScheme = 'product') {
  // Color schemes for different contexts
  const colorSchemes = {
    light: ['#f8fafc', '#f1f5f9', '#e2e8f0'],
    warm: ['#fef7ed', '#fed7aa', '#fdba74'], 
    cool: ['#f0f9ff', '#dbeafe', '#93c5fd'],
    product: ['#fafaf9', '#f5f5f4', '#e7e5e4'], // Neutral for products
    hero: ['#f9fafb', '#f3f4f6', '#d1d5db'] // Subtle for hero sections
  };
  
  const colors = colorSchemes[colorScheme] || colorSchemes.product;
  
  // Create enhanced blur placeholder with subtle texture
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
          <stop offset="50%" style="stop-color:${colors[1]};stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:${colors[2]};stop-opacity:0.8" />
        </linearGradient>
        <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad1)" filter="url(#blur)" />
    </svg>
  `)}`;
}

/**
 * Get an instant blur placeholder optimized for the image type
 * @param {string} imageType - Type: 'hero', 'product', 'thumbnail', 'card'
 * @returns {string} Optimized blur placeholder
 */
export function getInstantBlurPlaceholder(imageType = 'product') {
  const configs = {
    hero: { width: 80, height: 40, scheme: 'hero' },
    product: { width: 60, height: 60, scheme: 'product' },
    thumbnail: { width: 30, height: 30, scheme: 'light' },
    card: { width: 40, height: 40, scheme: 'warm' }
  };
  
  const config = configs[imageType] || configs.product;
  return createBlurPlaceholder(config.width, config.height, config.scheme);
}

/**
 * Preloads critical images for better performance with smart caching
 * @param {Array} imageUrls - Array of image URLs to preload
 * @param {string} quality - Quality preset for preloading ('thumbnail' or 'product')
 */
export function preloadImages(imageUrls, quality = 'thumbnail') {
  imageUrls.forEach((url, index) => {
    if (url) {
      // Use requestIdleCallback for non-critical preloading
      const preloadFn = () => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = quality === 'thumbnail' ? getThumbnail(url) : optimizeImage(url, quality);
        link.onload = () => {
          // Remove link after loading to avoid memory leaks
          setTimeout(() => {
            if (link.parentNode) {
              link.parentNode.removeChild(link);
            }
          }, 1000);
        };
        document.head.appendChild(link);
      };

      if (index < 3) {
        // Preload first 3 images immediately
        preloadFn();
      } else {
        // Delay preload for remaining images
        if (window.requestIdleCallback) {
          window.requestIdleCallback(preloadFn, { timeout: 2000 });
        } else {
          setTimeout(preloadFn, 500 + (index * 100));
        }
      }
    }
  });
}

/**
 * Ultra-fast critical image preloading for instant visual feedback
 * @param {Array} imageUrls - Array of critical image URLs to preload immediately
 * @param {Object} options - Preload options
 */
export function preloadCriticalImages(imageUrls, options = {}) {
  const {
    maxConcurrent = 4, // Limit concurrent requests to avoid overwhelming
    useUltraFast = true // Use ultra-fast thumbnails for immediate loading
  } = options;

  if (!imageUrls.length) return Promise.resolve([]);

  // Split into batches for controlled loading
  const batches = [];
  for (let i = 0; i < imageUrls.length; i += maxConcurrent) {
    batches.push(imageUrls.slice(i, i + maxConcurrent));
  }

  const loadBatch = (urls) => {
    return Promise.all(
      urls.map(url => {
        if (!url) return Promise.resolve();
        
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(url);
          img.onerror = () => resolve(); // Don't fail entire batch on single error
          
          // Use ultra-fast thumbnail for immediate preload, then optimized
          img.src = useUltraFast ? getUltraFastThumbnail(url) : optimizeImage(url, 'thumbnail');
          
          // Timeout after 2 seconds to prevent hanging
          setTimeout(() => resolve(), 2000);
        });
      })
    );
  };

  // Load first batch immediately, others with slight delay
  return batches.reduce((promise, batch, index) => {
    return promise.then(() => {
      if (index === 0) {
        return loadBatch(batch);
      } else {
        return new Promise(resolve => {
          setTimeout(() => loadBatch(batch).then(resolve), index * 50);
        });
      }
    });
  }, Promise.resolve());
}

/**
 * Advanced image preloading with priority and batch processing
 * @param {Array} imageUrls - Array of image URLs to preload
 * @param {Object} options - Preload options
 */
export function preloadImagesAdvanced(imageUrls, options = {}) {
  const {
    quality = 'product',
    priority = false,
    batchSize = 3,
    delay = 100
  } = options;

  // Split into batches for better performance
  const batches = [];
  for (let i = 0; i < imageUrls.length; i += batchSize) {
    batches.push(imageUrls.slice(i, i + batchSize));
  }

  batches.forEach((batch, batchIndex) => {
    const batchDelay = priority ? 0 : batchIndex * delay;
    
    setTimeout(() => {
      batch.forEach(url => {
        if (url) {
          const img = new Image();
          img.src = optimizeImage(url, quality);
        }
      });
    }, batchDelay);
  });
}

/**
 * Lazy loading intersection observer
 */
export function createLazyLoadObserver(callback) {
  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry.target);
      }
    });
  }, {
    rootMargin: '50px' // Start loading 50px before the image enters viewport
  });
}

/**
 * Performance monitoring for image loading
 */
export function trackImagePerformance(imageUrl, startTime) {
  const loadTime = Date.now() - startTime;
  
  // Log slow images (> 2 seconds)
  if (loadTime > 2000) {
    console.warn(`Slow image load: ${imageUrl} took ${loadTime}ms`);
  }
  
  return loadTime;
}

/**
 * React hook for optimized image loading with states
 */
export function useOptimizedImage(src, size = 'card') {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);
  const [loadTime, setLoadTime] = React.useState(0);
  
  const optimizedSrc = React.useMemo(() => optimizeImage(src, size), [src, size]);
  
  React.useEffect(() => {
    if (!src) return;
    
    const startTime = Date.now();
    setIsLoading(true);
    setIsError(false);
    
    const img = new Image();
    img.onload = () => {
      setIsLoading(false);
      const time = trackImagePerformance(optimizedSrc, startTime);
      setLoadTime(time);
    };
    img.onerror = () => {
      setIsLoading(false);
      setIsError(true);
    };
    img.src = optimizedSrc;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, optimizedSrc]);
  
  return { optimizedSrc, isLoading, isError, loadTime };
}

// Blur placeholder CSS as a string for inline styles
export const BLUR_PLACEHOLDER_STYLE = {
  filter: 'blur(10px)',
  transition: 'filter 0.3s ease-out',
  background: 'linear-gradient(45deg, #f3f4f6, #e5e7eb)'
};

export const LOADED_IMAGE_STYLE = {
  filter: 'blur(0px)',
  transition: 'filter 0.3s ease-out'
};

/**
 * Cache management utilities
 */
export function clearImageCache() {
  IMAGE_CACHE.clear();
}

export function getCacheSize() {
  return IMAGE_CACHE.size;
}

export function getCacheStats() {
  let totalSize = 0;
  let expired = 0;
  const now = Date.now();
  
  IMAGE_CACHE.forEach(cached => {
    totalSize++;
    if (now - cached.timestamp > CACHE_EXPIRY) {
      expired++;
    }
  });
  
  return { totalSize, expired, hitRate: totalSize > 0 ? ((totalSize - expired) / totalSize * 100).toFixed(1) : 0 };
}

/**
 * Responsive image sources with different sizes for different devices
 * @param {string} imageUrl - Original image URL
 * @param {Object} options - Configuration options
 * @returns {Object} Responsive image object with srcSet
 */
export function createResponsiveImage(imageUrl, options = {}) {
  const { 
    sizes = ['thumbnail', 'card', 'product', 'productHigh'],
    defaultSize = 'product'
  } = options;

  const srcSet = sizes.map(size => {
    const config = IMAGE_SIZES[size];
    if (!config) return '';
    
    const optimizedUrl = optimizeImage(imageUrl, size);
    return `${optimizedUrl} ${config.width}w`;
  }).filter(Boolean).join(', ');

  return {
    src: optimizeImage(imageUrl, defaultSize),
    srcSet,
    sizes: "(max-width: 480px) 150px, (max-width: 768px) 250px, (max-width: 1024px) 500px, 1000px"
  };
}