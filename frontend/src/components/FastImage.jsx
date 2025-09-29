import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { optimizeImage, getThumbnail, getUltraFastThumbnail, getInstantBlurPlaceholder, getFullQualityImage } from '../utils/imageOptimizer';

/**
 * FastImage Component - Mobile-optimized with guaranteed fallbacks
 * Features: Always shows something, mobile-friendly loading, robust error handling
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
  const [loadState, setLoadState] = useState('loading'); // loading, loaded, error
  const [isInView, setIsInView] = useState(priority);
  const [currentSrc, setCurrentSrc] = useState('');
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const imgRef = useRef(null);
  const observerRef = useRef(null);
  const loadTimeoutRef = useRef(null);

  // Check if we're on mobile for different optimization strategy
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Mobile-optimized image sources with guaranteed fallbacks
  const { thumbnailSrc, optimizedSrc, safeFallback } = useMemo(() => {
    if (!src) return { 
      thumbnailSrc: fallback, 
      optimizedSrc: fallback,
      safeFallback: fallback
    };
    
    // On mobile, use more aggressive optimization
    const mobileOptimization = isMobile ? { quality: 40, width: 300 } : {};
    
    return {
      thumbnailSrc: isMobile ? getUltraFastThumbnail(src) : optimizeImage(src, 'thumbnail'),
      optimizedSrc: optimizeImage(src, size, mobileOptimization),
      safeFallback: fallback
    };
  }, [src, size, fallback, isMobile]);

  // Mobile-friendly intersection observer
  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    // More conservative settings for mobile to prevent overwhelming slow connections
    const rootMargin = isMobile ? '100px' : '200px';
    const threshold = isMobile ? 0.1 : 0.01;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { rootMargin, threshold }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [priority, isMobile]);

  // Simplified, robust image loading with mobile optimization
  useEffect(() => {
    if (!isInView || !src || hasError) return;
    
    setLoadState('loading');
    
    // Set timeout for loading - more generous on mobile
    const timeout = isMobile ? 8000 : 5000;
    loadTimeoutRef.current = setTimeout(() => {
      handleImageError();
    }, timeout);
    
    // Try loading optimized image first
    const img = new Image();
    
    img.onload = () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      setCurrentSrc(optimizedSrc);
      setLoadState('loaded');
      setHasError(false);
      onLoad?.();
    };
    
    img.onerror = () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      
      // Try thumbnail as fallback
      if (thumbnailSrc !== optimizedSrc && retryCount === 0) {
        setRetryCount(1);
        const fallbackImg = new Image();
        
        fallbackImg.onload = () => {
          setCurrentSrc(thumbnailSrc);
          setLoadState('loaded');
          setHasError(false);
          onLoad?.();
        };
        
        fallbackImg.onerror = () => {
          handleImageError();
        };
        
        fallbackImg.src = thumbnailSrc;
      } else {
        handleImageError();
      }
    };
    
    img.src = optimizedSrc;
    
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [isInView, src, optimizedSrc, thumbnailSrc, hasError, retryCount, isMobile, onLoad]);

  const handleImageError = useCallback(() => {
    console.warn('FastImage: Failed to load image', src, 'using fallback:', safeFallback);
    
    // Always try to show fallback image
    if (safeFallback && currentSrc !== safeFallback) {
      setCurrentSrc(safeFallback);
      setLoadState('loaded');
      setHasError(false);
    } else {
      setLoadState('error');
      setHasError(true);
    }
    
    onError?.();
  }, [src, safeFallback, currentSrc, onError]);

  return (
    <div ref={imgRef} className={`relative overflow-hidden bg-gray-50 min-h-[150px] ${className}`}>
      {/* Always show a placeholder background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
      
      {/* Loading shimmer */}
      {loadState === 'loading' && showLoader && (
        <div className="absolute inset-0 z-10 shimmer" />
      )}
      
      {/* Main image */}
      {currentSrc && loadState === 'loaded' && (
        <img
          src={currentSrc}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 opacity-100"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={handleImageError}
          {...props}
        />
      )}
      
      {/* Error state with better fallback */}
      {loadState === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500">
          <div className="text-center p-4">
            <div className="text-2xl mb-2 text-gray-400">🖼️</div>
            <div className="text-xs font-medium">Image not available</div>
          </div>
        </div>
      )}
      
      {/* Loading state */}
      {loadState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-xl mb-1">📷</div>
            <div className="text-xs">Loading...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FastImage;