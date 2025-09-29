import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { optimizeImage, getThumbnail, getUltraFastThumbnail, getInstantBlurPlaceholder, getFullQualityImage } from '../utils/imageOptimizer';
import { imagePerformanceMonitor } from '../utils/imagePerformanceMonitor';

/**
 * FastImage Component - Ultra-fast blur-to-sharp progressive loading
 * Features: Instant blur placeholder, progressive loading (blur->thumbnail->optimized->full), 
 *           aggressive preloading, lazy loading, error handling
 */
const FastImage = ({
  src,
  alt = '',
  className = '',
  size = 'card',
  priority = false,
  showLoader = true,
  placeholder = null,
  fallback = '/Designer.jpg',
  onLoad,
  onError,
  ...props
}) => {
  const [loadState, setLoadState] = useState('blur'); // blur, thumbnail, loaded, error
  const [isInView, setIsInView] = useState(priority);
  const [currentSrc, setCurrentSrc] = useState('');
  const [showBlur, setShowBlur] = useState(true);
  
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Memoized progressive loading sources for maximum performance
  const { blurPlaceholder, thumbnailSrc, optimizedSrc, fullQualitySrc } = useMemo(() => {
    if (!src) return { 
      blurPlaceholder: getInstantBlurPlaceholder('card'), 
      thumbnailSrc: fallback, 
      optimizedSrc: fallback,
      fullQualitySrc: fallback
    };
    
    return {
      blurPlaceholder: getInstantBlurPlaceholder(size), // Context-aware instant blur placeholder
      thumbnailSrc: getUltraFastThumbnail(src), // Ultra fast 35% quality - ~50ms load time
      optimizedSrc: optimizeImage(src, size), // Optimized for display size - ~200ms load time
      fullQualitySrc: getFullQualityImage(src) // Full quality for zoom/detail views
    };
  }, [src, size, fallback]);

  // Setup intersection observer for lazy loading with aggressive preloading
  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { 
        rootMargin: '200px', // Very aggressive preloading - start 200px before visible
        threshold: 0.01 // Trigger as soon as any part enters the margin
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  // Progressive loading with performance tracking: blur -> thumbnail -> optimized -> full quality
  useEffect(() => {
    if (!isInView || !src) return;
    
    // Start performance tracking
    const perfTracker = imagePerformanceMonitor.trackImageStart(src);
    
    // Stage 1: Blur placeholder is already shown by default
    setLoadState('blur');
    setShowBlur(true);
    
    // Stage 2: Load ultra-fast thumbnail immediately (target: 50ms)
    const thumbnailImg = new Image();
    thumbnailImg.onload = () => {
      setCurrentSrc(thumbnailSrc);
      setLoadState('thumbnail');
      
      // Stage 3: Load optimized image (target: 200ms)
      const optimizedImg = new Image();
      optimizedImg.onload = () => {
        setCurrentSrc(optimizedSrc);
        setLoadState('loaded');
        setShowBlur(false);
        
        // Mark as successfully loaded
        perfTracker.complete(true);
        onLoad?.(); // Notify parent component
        
        // Stage 4: Preload full quality in background for potential zoom/detail view
        if (size === 'product' || size === 'hero' || priority) {
          // Use requestIdleCallback for non-blocking background preload
          const preloadFullQuality = () => {
            const fullQualityImg = new Image();
            fullQualityImg.src = fullQualitySrc;
          };
          
          if (window.requestIdleCallback) {
            window.requestIdleCallback(preloadFullQuality, { timeout: 1000 });
          } else {
            setTimeout(preloadFullQuality, 300);
          }
        }
      };
      optimizedImg.onerror = () => {
        perfTracker.complete(false);
        handleImageError();
      };
      optimizedImg.src = optimizedSrc;
    };
    thumbnailImg.onerror = () => {
      perfTracker.complete(false);
      handleImageError();
    };
    thumbnailImg.src = thumbnailSrc;
    
  }, [isInView, src, thumbnailSrc, optimizedSrc, fullQualitySrc, size, priority, onLoad]);

  const handleImageError = useCallback(() => {
    console.warn('FastImage: Failed to load image', src, 'using fallback:', fallback);
    if (currentSrc !== fallback && fallback) {
      setCurrentSrc(fallback);
      setLoadState('thumbnail'); // Treat fallback as loaded thumbnail
    } else {
      setLoadState('error');
      setShowBlur(false);
      onError?.();
    }
  }, [src, fallback, currentSrc, onError]);

  // Get the appropriate image source for zoom/detail views
  const getFullQualitySource = useCallback(() => {
    return fullQualitySrc || currentSrc || fallback;
  }, [fullQualitySrc, currentSrc, fallback]);

  return (
    <div ref={imgRef} className="relative overflow-hidden bg-gray-100">
      {/* Instant blur placeholder - shows immediately */}
      {showBlur && loadState !== 'error' && (
        <img
          src={blurPlaceholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm opacity-60"
          style={{ 
            transition: 'opacity 0.3s ease-out',
            opacity: loadState === 'loaded' ? 0 : 0.6 
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Shimmer loading animation overlay */}
      {(loadState === 'blur' || loadState === 'thumbnail') && showLoader && (
        <div className="absolute inset-0 z-10 shimmer" style={{
          opacity: loadState === 'loaded' ? 0 : 1,
          transition: 'opacity 0.3s ease-out'
        }} />
      )}
      
      {/* Main progressive image */}
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-all duration-300 ${
            loadState === 'loaded' ? 'opacity-100 filter-none' : 'opacity-80'
          } ${className}`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          style={{
            transition: 'opacity 0.3s ease-out, filter 0.3s ease-out'
          }}
          {...props}
        />
      )}
      
      {/* Error state */}
      {loadState === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
          <div className="text-center p-4">
            <div className="text-gray-400 mb-2">📷</div>
            <div>Image unavailable</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Expose method for getting full quality source (for zoom components)
FastImage.getFullQualitySource = (src, size = 'productHigh') => {
  return src ? getFullQualityImage(src) : '';
};

export default FastImage;