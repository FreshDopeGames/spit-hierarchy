
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface BlogImageSizes {
  thumbnail?: string;
  medium?: string;
  large?: string;
  hero?: string;
}

interface ResponsiveImageProps {
  src: string | BlogImageSizes;
  alt: string;
  className?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  context?: 'thumbnail' | 'card' | 'hero' | 'carousel';
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
}

const ResponsiveImage = ({
  src,
  alt,
  className,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  loading = 'lazy',
  onError,
  onLoad,
  context = 'card',
  objectFit
}: ResponsiveImageProps) => {
  const [imageError, setImageError] = useState(false);

  // Determine object-fit based on context if not explicitly provided
  const getObjectFit = () => {
    if (objectFit) return objectFit;
    
    switch (context) {
      case 'carousel':
        return 'contain'; // Show full image in carousel
      case 'hero':
        return 'cover'; // Cover for hero images
      case 'thumbnail':
        return 'cover'; // Cover for thumbnails
      case 'card':
      default:
        return 'cover'; // Default to cover
    }
  };

  const objectFitClass = `object-${getObjectFit()}`;

  // If src is a string (legacy single image), use it directly
  if (typeof src === 'string') {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(objectFitClass, className)}
        loading={loading}
        onError={(e) => {
          setImageError(true);
          onError?.(e);
        }}
        onLoad={onLoad}
      />
    );
  }

  // If src is an object with multiple sizes, choose appropriate size based on context
  const getImageSource = () => {
    switch (context) {
      case 'thumbnail':
        return src.thumbnail || src.medium || src.large || src.hero;
      case 'card':
        return src.medium || src.large || src.hero || src.thumbnail;
      case 'hero':
        return src.hero || src.large || src.medium || src.thumbnail;
      case 'carousel':
        return src.large || src.hero || src.medium || src.thumbnail;
      default:
        return src.medium || src.large || src.hero || src.thumbnail;
    }
  };

  const imageSrc = getImageSource();

  if (!imageSrc || imageError) {
    return (
      <div className={cn('bg-gray-200 flex items-center justify-center', className)}>
        <span className="text-gray-400 text-sm">Image not available</span>
      </div>
    );
  }

  // Build srcSet for responsive images
  const buildSrcSet = () => {
    const srcSet = [];
    if (src.thumbnail) srcSet.push(`${src.thumbnail} 300w`);
    if (src.medium) srcSet.push(`${src.medium} 600w`);
    if (src.large) srcSet.push(`${src.large} 1200w`);
    if (src.hero) srcSet.push(`${src.hero} 1920w`);
    return srcSet.join(', ');
  };

  return (
    <img
      src={imageSrc}
      srcSet={buildSrcSet()}
      sizes={sizes}
      alt={alt}
      className={cn(objectFitClass, className)}
      loading={loading}
      onError={(e) => {
        setImageError(true);
        onError?.(e);
      }}
      onLoad={onLoad}
    />
  );
};

export default ResponsiveImage;
