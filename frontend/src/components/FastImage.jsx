import React, { useState, useRef, useEffect, useCallback } from 'react';
import { optimizeImage, getThumbnail, createBlurPlaceholder } from '../utils/imageOptimizer';

/**
 * FastImage Component - Optimized for production speed
 * Features: Progressive loading, aggressive caching, lazy loading, error handling
 */
const FastImage = ({
  src,
  alt = '',
  className = '',
  size = 'card',
  priority = false,
  showLoader = true,
  placeholder = null,
  fallback = null,
  onLoad,
  onError,
  ...props
}) => {
  const [loadState, setLoadState] = useState('loading'); // loading, loaded, error
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Memoized optimized URLs
  const optimizedSrc = React.useMemo(() => 
    src ? optimizeImage(src, size) : '', 
    [src, size]
  );
  
  const thumbnailSrc = React.useMemo(() => 
    src ? getThumbnail(src) : '', 
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

    observerRef.current.observe(imgRef.current);

    return () => observerRef.current?.disconnect();
  }, [priority]);

  // Image loading logic
  useEffect(() => {
    if (!isInView || !optimizedSrc) return;

    const img = new Image();
    
    img.onload = () => {
      setLoadState('loaded');
      onLoad?.(img);
    };
    
    img.onerror = () => {
      setLoadState('error');
      onError?.(img);
    };

    // Use thumbnail for immediate display, then load full quality
    img.src = size === 'thumbnail' ? thumbnailSrc : optimizedSrc;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [isInView, optimizedSrc, thumbnailSrc, size, onLoad, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  if (loadState === 'error') {
    return fallback || (
      <div 
        ref={imgRef}
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        {...props}
      >
        <div className="text-gray-400 text-center">
          <svg className="w-4 h-4 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs">No image</span>
        </div>
      </div>
    );
  }

  if (!isInView || loadState === 'loading') {
    return (
      <div 
        ref={imgRef}
        className={`relative ${className}`}
        {...props}
      >
        {placeholder || (
          <div 
            className="w-full h-full bg-gray-100"
            style={{
              backgroundImage: `url(${createBlurPlaceholder(200, 200)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {showLoader && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`relative ${className}`} {...props}>
      <img
        src={optimizedSrc}
        alt={alt}
        className="w-full h-full object-cover transition-opacity duration-300"
        style={{ opacity: loadState === 'loaded' ? 1 : 0 }}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    </div>
  );
};

export default FastImage;