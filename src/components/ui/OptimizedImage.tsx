
import React from 'react';
import LazyImage from './LazyImage';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  sizes?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  containerClassName,
  priority = false,
  sizes = "100vw",
  ...props
}) => {
  // Generate responsive image URLs (placeholder logic - would use actual CDN)
  const generateSrcSet = (baseSrc: string) => {
    const sizes = [320, 640, 768, 1024, 1280, 1920];
    return sizes
      .map(size => `${baseSrc}?w=${size} ${size}w`)
      .join(', ');
  };

  const srcSet = src.startsWith('http') ? generateSrcSet(src) : undefined;

  return (
    <LazyImage
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      className={cn("object-cover", className)}
      containerClassName={containerClassName}
      lazy={!priority}
      {...props}
    />
  );
};

export default OptimizedImage;
