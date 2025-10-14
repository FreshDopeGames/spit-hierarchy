import React from 'react';
import { cn } from '@/lib/utils';

interface EnhancedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  size?: 'thumb' | 'medium' | 'large' | 'xlarge';
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  onLoad?: () => void;
}

const EnhancedImage: React.FC<EnhancedImageProps> = ({
  src,
  alt,
  className,
  containerClassName,
  priority = false,
  size = 'medium',
  onError,
  onLoad,
  ...props
}) => {
  // Enhanced CSS classes for optimal image rendering
  const imageClasses = cn(
    // Base image styling
    "w-full h-full object-cover object-top",
    // Better image rendering - smooth at all sizes
    "[image-rendering:auto]",
    "[image-rendering:-webkit-optimize-contrast]", 
    "antialiased",
    // Hardware acceleration
    "transform-gpu",
    "will-change-transform",
    // Anti-aliasing and smoothing
    "[filter:blur(0)]",
    "[backface-visibility:hidden]",
    "translate-z-0",
    className
  );

  return (
    <div className={cn("overflow-hidden", containerClassName)}>
      <img 
        src={src}
        alt={alt}
        className={imageClasses}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        onError={onError}
        onLoad={onLoad}
        {...props}
      />
    </div>
  );
};

export default EnhancedImage;