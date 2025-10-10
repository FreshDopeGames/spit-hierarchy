import { useState } from "react";
import { Disc3, Music } from "lucide-react";

interface AlbumCoverImageProps {
  coverUrl?: string | null;
  title: string;
  releaseType: 'album' | 'mixtape';
  placeholderColors: {
    bgColor: string;
    primary: string;
    textColor: string;
  };
}

export const AlbumCoverImage = ({ 
  coverUrl, 
  title, 
  releaseType,
  placeholderColors 
}: AlbumCoverImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const Icon = releaseType === 'album' ? Disc3 : Music;
  const iconColor = releaseType === 'album' ? 'hsl(var(--theme-primary))' : 'hsl(var(--theme-secondary))';

  // Show placeholder if no URL, error, or still loading
  const showPlaceholder = !coverUrl || imageError || !imageLoaded;

  return (
    <div 
      className="w-12 h-12 rounded flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundColor: placeholderColors.bgColor,
        background: `linear-gradient(135deg, ${placeholderColors.bgColor}, ${placeholderColors.primary})`
      }}
    >
      {/* Cover Art Image */}
      {coverUrl && !imageError && (
        <img
          src={coverUrl}
          alt={`${title} cover art`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          loading="lazy"
        />
      )}
      
      {/* Placeholder Icon (shown when loading, error, or no cover art) */}
      {showPlaceholder && (
        <>
          <Icon 
            className="w-6 h-6 relative z-10" 
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
