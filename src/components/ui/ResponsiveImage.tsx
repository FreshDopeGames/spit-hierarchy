import React, { useState, useCallback } from 'react';
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
  priority?: boolean; // For critical images (LCP)
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  context?: 'thumbnail' | 'card' | 'hero' | 'carousel';
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  showBlurPlaceholder?: boolean;
}

const ResponsiveImage = ({
  src,
  alt,
  className,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  loading = 'lazy',
  priority = false,
  onError,
  onLoad,
  context = 'card',
  objectFit,
  showBlurPlaceholder = true
}: ResponsiveImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Determine object-fit based on context if not explicitly provided
  const getObjectFit = () => {
    if (objectFit) return objectFit;
    
    switch (context) {
      case 'carousel':
      case 'hero':
      case 'thumbnail':
      case 'card':
      default:
        return 'contain';
    }
  };

  const objectFitClass = `object-${getObjectFit()}`;

  const handleLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    onLoad?.(e);
  }, [onLoad]);

  const handleError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setImageError(true);
    onError?.(e);
  }, [onError]);

  // Blur placeholder styles
  const placeholderStyles = showBlurPlaceholder && !isLoaded ? {
    filter: 'blur(10px)',
    transform: 'scale(1.1)',
  } : {};

  const transitionStyles = showBlurPlaceholder ? {
    transition: 'filter 0.3s ease-out, transform 0.3s ease-out',
  } : {};

  // If src is a string (legacy single image), use it directly
  if (typeof src === 'string') {
    return (
      <div className={cn('relative overflow-hidden', className)}>
        {/* Blur placeholder background */}
        {showBlurPlaceholder && !isLoaded && (
          <div 
            className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--theme-surface))] to-[hsl(var(--theme-background))] animate-pulse"
          />
        )}
        <img
          src={src}
          alt={alt}
          className={cn(objectFitClass, 'w-full h-full', isLoaded ? 'opacity-100' : 'opacity-0')}
          style={{ ...placeholderStyles, ...transitionStyles, transition: 'opacity 0.3s ease-out' }}
          loading={priority ? 'eager' : loading}
          fetchPriority={priority ? 'high' : undefined}
          onError={handleError}
          onLoad={handleLoad}
        />
      </div>
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
      <div className={cn('bg-[hsl(var(--theme-surface))] flex items-center justify-center', className)}>
        <span className="text-[hsl(var(--muted-foreground))] text-sm">Image not available</span>
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
    <div className={cn('relative overflow-hidden', className)}>
      {/* Blur placeholder background */}
      {showBlurPlaceholder && !isLoaded && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--theme-surface))] to-[hsl(var(--theme-background))] animate-pulse"
        />
      )}
      <img
        src={imageSrc}
        srcSet={buildSrcSet()}
        sizes={sizes}
        alt={alt}
        className={cn(objectFitClass, 'w-full h-full', isLoaded ? 'opacity-100' : 'opacity-0')}
        style={{ transition: 'opacity 0.3s ease-out' }}
        loading={priority ? 'eager' : loading}
        fetchPriority={priority ? 'high' : undefined}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
};

export default ResponsiveImage;
