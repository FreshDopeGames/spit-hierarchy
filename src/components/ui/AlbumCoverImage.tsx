import { useState } from "react";
import { Disc3, Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlbumCoverImageProps {
  coverUrl?: string | null;
  cachedCoverUrl?: string | null;
  title: string;
  releaseType: 'album' | 'mixtape';
  placeholderColors: {
    bgColor: string;
    primary: string;
    textColor: string;
  };
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-full aspect-square',
  lg: 'w-full aspect-square',
};

const iconSizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

export const AlbumCoverImage = ({ 
  coverUrl, 
  cachedCoverUrl,
  title, 
  releaseType,
  placeholderColors,
  size = 'sm',
}: AlbumCoverImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const Icon = releaseType === 'album' ? Disc3 : Music;
  const iconColor = releaseType === 'album' ? 'hsl(var(--theme-primary))' : 'hsl(var(--theme-secondary))';

  const imageUrl = cachedCoverUrl || coverUrl;
  const showPlaceholder = !imageUrl || imageError || !imageLoaded;

  return (
    <div 
      className={cn(
        "rounded flex items-center justify-center relative overflow-hidden",
        sizeClasses[size]
      )}
      style={{
        backgroundColor: placeholderColors.bgColor,
        background: `linear-gradient(135deg, ${placeholderColors.bgColor}, ${placeholderColors.primary})`
      }}
    >
      {imageUrl && !imageError && (
        <img
          src={imageUrl}
          alt={`${title} cover art`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          loading="lazy"
        />
      )}
      
      {showPlaceholder && (
        <>
          <Icon 
            className={cn("relative z-10", iconSizeClasses[size])}
            style={{ color: iconColor }}
          />
          <div 
            className="absolute inset-0 opacity-10" 
            style={{
              backgroundImage: releaseType === 'album' 
                ? `radial-circle(at, ${placeholderColors.textColor} 1px, transparent 1px)`
                : `linear-gradient(45deg, ${placeholderColors.textColor} 25%, transparent 25%, transparent 75%, ${placeholderColors.textColor} 75%, ${placeholderColors.textColor} 0%)`,
              backgroundSize: releaseType === 'album' ? '8px 8px' : '6px 6px'
            }}
          />
        </>
      )}
    </div>
  );
};
