import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { optimizeImage, getThumbnail, getUltraFastThumbnail, getBlurVersion, getFullQualityImage } from '../utils/imageOptimizer';

/**
 * FastImage Component - True blur-to-sharp progressive loading
 * Shows blurred version of actual image first, then sharp version
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
  const [loadState, setLoadState] = useState('blur'); // blur, loading, loaded, error
  const [isInView, setIsInView] = useState(priority);
  const [blurSrc, setBlurSrc] = useState('');
  const [sharpSrc, setSharpSrc] = useState('');
  const [showSharp, setShowSharp] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const imgRef = useRef(null);
  const observerRef = useRef(null);
  const loadTimeoutRef = useRef(null);

  // Check if we're on mobile for different optimization strategy
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Generate blur and sharp versions of the same image
  const { blurImageSrc, sharpImageSrc, fallbackSrc } = useMemo(() => {
    if (!src) return { 
      blurImageSrc: null, 
      sharpImageSrc: null,
      fallbackSrc: fallback
    };
    
    // Create ultra-fast blur version (should load in ~50ms)
    const blurVersion = getBlurVersion(src);
    
    // Create optimized sharp version
    const sharpVersion = optimizeImage(src, size, 
      isMobile ? { quality: 65, width: 400 } : { quality: 75 }
    );
    
    return {
      blurImageSrc: blurVersion,
      sharpImageSrc: sharpVersion,
      fallbackSrc: fallback
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

  // Progressive loading: blur image first, then sharp image
  useEffect(() => {
    if (!isInView || !src || hasError) return;
    
    setLoadState('blur');
    
    // Step 1: Load blurred version immediately (should be very fast)
    const blurImg = new Image();
    blurImg.onload = () => {
      setBlurSrc(blurImageSrc);
      setLoadState('loading');
      
      // Step 2: Load sharp version in background
      const sharpImg = new Image();
      
      // Set timeout for sharp image loading
      const timeout = isMobile ? 10000 : 7000; // Very generous timeout
      loadTimeoutRef.current = setTimeout(() => {
        // If sharp image takes too long, keep showing blur version
        console.warn('Sharp image load timeout, keeping blur version');
      }, timeout);
      
      sharpImg.onload = () => {
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
        }
        setSharpSrc(sharpImageSrc);
        setLoadState('loaded');
        
        // Smooth transition to sharp image
        setTimeout(() => {
          setShowSharp(true);
          onLoad?.();
        }, 100);
      };
      
      sharpImg.onerror = () => {
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
        }
        
        // Sharp image failed, but we have blur version - that's okay
        console.warn('Sharp image failed to load, keeping blur version');
        setLoadState('loaded'); // Consider blur version as "loaded"
        onLoad?.();
      };
      
      sharpImg.src = sharpImageSrc;
    };
    
    blurImg.onerror = () => {
      // Even blur version failed, try fallback
      handleImageError();
    };
    
    blurImg.src = blurImageSrc;
    
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [isInView, src, blurImageSrc, sharpImageSrc, hasError, isMobile, onLoad]);

  const handleImageError = useCallback(() => {
    console.warn('FastImage: Failed to load image', src);
    
    // Only use fallback as absolute last resort - try to avoid Designer.jpg
    setLoadState('error');
    setHasError(true);
    onError?.();
  }, [src, onError]);

  return (
    <div ref={imgRef} className={`relative overflow-hidden bg-gray-50 min-h-[150px] ${className}`}>
      {/* Background gradient placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
      
      {/* Blurred version of actual image (shows first) */}
      {blurSrc && loadState !== 'error' && (
        <img
          src={blurSrc}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
            showSharp ? 'opacity-0 scale-105 blur-sm' : 'opacity-100 blur-sm'
          }`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          style={{ filter: 'blur(8px)' }}
        />
      )}
      
      {/* Sharp version of image (shows after blur) */}
      {sharpSrc && showSharp && (
        <img
          src={sharpSrc}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-500 opacity-100"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={handleImageError}
          {...props}
        />
      )}
      
      {/* Loading shimmer overlay (only during loading state) */}
      {loadState === 'loading' && showLoader && (
        <div className="absolute inset-0 z-10 shimmer opacity-30" />
      )}
      
      {/* Error state - avoid showing Designer.jpg unless absolutely necessary */}
      {loadState === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
          <div className="text-center p-4">
            <div className="text-3xl mb-2 opacity-60">🖼️</div>
            <div className="text-xs font-medium">Unable to load image</div>
          </div>
        </div>
      )}
      
      {/* Initial blur state indicator */}
      {loadState === 'blur' && !blurSrc && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-2xl mb-1 opacity-50">�</div>
            <div className="text-xs opacity-75">Loading...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FastImage;