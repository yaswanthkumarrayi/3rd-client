/**
 * Mobile Image Wrapper - Ensures consistent image display on mobile devices
 * Handles edge cases like slow networks, missing images, and layout shifts
 */
import React from 'react';
import FastImage from './FastImage';

const MobileImageWrapper = ({ 
  children, 
  className = '', 
  minHeight = '150px',
  aspectRatio = 'auto',
  ...props 
}) => {
  return (
    <div 
      className={`relative w-full ${className}`}
      style={{ 
        minHeight,
        aspectRatio: aspectRatio !== 'auto' ? aspectRatio : undefined
      }}
    >
      {children}
    </div>
  );
};

// Enhanced FastImage specifically for mobile with guaranteed dimensions
const MobileFastImage = ({ 
  src, 
  alt = '', 
  className = '',
  aspectRatio = '1/1',
  minHeight = '200px',
  ...props 
}) => {
  return (
    <MobileImageWrapper 
      className={className}
      aspectRatio={aspectRatio}
      minHeight={minHeight}
    >
      <FastImage
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full"
        {...props}
      />
    </MobileImageWrapper>
  );
};

export { MobileImageWrapper, MobileFastImage };
export default MobileFastImage;