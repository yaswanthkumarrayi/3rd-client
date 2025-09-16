/**
 * Image optimization utility for Supabase transformations
 * Applies ?width=400&quality=70&format=webp for fast loading
 */

// Default optimization parameters for fast loading
const DEFAULT_TRANSFORMATIONS = {
  width: 400,
  quality: 70,
  format: 'webp'
};

// Different sizes for different use cases
// Thumbnail: 200px, 55% quality, WebP - optimized for MAX 200KB for ultra-fast loading on home/list pages
// Card: 250px, 60% quality, WebP - for home page cards if needed
// Hero: 800px, 80% quality, WebP - for hero sections
// Product: 600px, 75% quality, WebP - optimized for fast product page loading (good balance)
// ProductHigh: 1200px, 90% quality, WebP - highest quality for product details (only when needed)
// Category: 300px, 70% quality, WebP - for category images
const IMAGE_SIZES = {
  thumbnail: { width: 200, quality: 55, format: 'webp' }, // Optimized for MAX 200KB
  card: { width: 250, quality: 60, format: 'webp' }, // For home page cards
  hero: { width: 800, quality: 80, format: 'webp' },
  product: { width: 600, quality: 75, format: 'webp' }, // Fast loading for product page
  productHigh: { width: 1200, quality: 90, format: 'webp' }, // Highest quality for product details
  category: { width: 300, quality: 70, format: 'webp' }
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
  
  // Get size preset or use default
  const sizeConfig = IMAGE_SIZES[size] || DEFAULT_TRANSFORMATIONS;
  
  // Merge with custom parameters
  const params = { ...sizeConfig, ...customParams };
  
  // Build query string
  const queryParams = new URLSearchParams(params).toString();
  
  // Add transformations to Supabase URL
  const separator = imageUrl.includes('?') ? '&' : '?';
  return `${imageUrl}${separator}${queryParams}`;
}

/**
 * Get optimized thumbnail for ultra-fast loading (max 200KB)
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
 * Creates a blur placeholder data URL
 * @param {number} width - Placeholder width
 * @param {number} height - Placeholder height
 * @returns {string} Data URL for blur placeholder
 */
export function createBlurPlaceholder(width = 40, height = 40) {
  // Create a simple blur placeholder
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
    </svg>
  `)}`;
}

/**
 * Preloads critical images for better performance
 * @param {Array} imageUrls - Array of image URLs to preload
 * @param {string} quality - Quality preset for preloading ('thumbnail' or 'product')
 */
export function preloadImages(imageUrls, quality = 'thumbnail') {
  imageUrls.forEach(url => {
    if (url) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = quality === 'thumbnail' ? getThumbnail(url) : optimizeImage(url, quality);
      document.head.appendChild(link);
    }
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