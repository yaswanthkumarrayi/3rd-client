import React, { useState, useRef, useEffect, useCallback } from 'react';
import { optimizeImage, getThumbnail, getUltraFastThumbnail } from '../utils/imageOptimizer';

/**
 * FastImage Component - Optimized for production speed
 * Features: Progressive loading, aggressive caching, lazy loading, error handling, shimmer effect
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
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Memoized optimized URLs
  const optimizedSrc = React.useMemo(() => 
    src ? optimizeImage(src, size) : '', 
    [src, size]
  );
  
  const thumbnailSrc = React.useMemo(() => 
    src ? getUltraFastThumbnail(src) : '', 
    [src]
  );

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      { 
        rootMargin: '50px',
        threshold: 0.1 
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  // Set image source when in view
  useEffect(() => {
    if (isInView && optimizedSrc) {
      setCurrentSrc(optimizedSrc);
    }
  }, [isInView, optimizedSrc]);

  const handleImageLoad = useCallback(() => {
    setLoadState('loaded');
    onLoad?.();
  }, [onLoad]);

  const handleImageError = useCallback(() => {
    console.warn('FastImage: Failed to load', currentSrc, 'trying fallback:', fallback);
    if (currentSrc !== fallback && fallback) {
      setCurrentSrc(fallback);
      setLoadState('loading');
    } else {
      setLoadState('error');
      onError?.();
    }
  }, [currentSrc, fallback, onError]);

  return (
    <div ref={imgRef} className="relative overflow-hidden">
      {/* Shimmer loading placeholder */}
      {loadState === 'loading' && showLoader && (
        <div className="absolute inset-0 z-10 shimmer" />
      )}
      
      {/* Main image */}
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          className={`transition-opacity duration-300 ${loadState === 'loaded' ? 'opacity-100' : 'opacity-0'} ${className}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...props}
        />
      )}
      
      {/* Error state */}
      {loadState === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
          Image unavailable
        </div>
      )}
    </div>
  );
};

export default FastImage;