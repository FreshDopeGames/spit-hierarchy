import React from 'react';
import { cn } from '@/lib/utils';

interface EnhancedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  size?: 'thumb' | 'medium' | 'large' | 'xlarge';
  aspectRatio?: string;
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
  aspectRatio,
  onError,
  onLoad,
  ...props
}) => {
  const imageClasses = cn(
    "w-full h-full object-cover object-top",
    "[image-rendering:auto]",
    "antialiased",
    className
  );

  return (
    <div className={cn("overflow-hidden", containerClassName)} style={aspectRatio ? { aspectRatio } : undefined}>
      <img 
        src={src}
        alt={alt}
        className={imageClasses}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        onError={onError}
        onLoad={onLoad}
        {...props}
      />
    </div>
  );
};

export default EnhancedImage;
