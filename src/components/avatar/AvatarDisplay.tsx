
import React, { useState } from "react";
import { User } from "lucide-react";

interface AvatarDisplayProps {
  avatarUrl?: string;
  size: 'small' | 'medium' | 'large' | 'xlarge';
}

const AvatarDisplay = ({ avatarUrl, size }: AvatarDisplayProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [placeholderError, setPlaceholderError] = useState(false);

  // Placeholder image URL
  const placeholderImageUrl = "https://xzcmkssadekswmiqfbff.supabase.co/storage/v1/object/public/rapper-images/Rapper_Placeholder_01.png";

  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'w-8 h-8';
      case 'medium': return 'w-16 h-16';
      case 'large': return 'w-24 h-24';
      case 'xlarge': return 'w-36 h-36';
      default: return 'w-24 h-24';
    }
  };

  const getAvatarUrl = (baseUrl?: string) => {
    if (!baseUrl) return undefined;
    
    // If it's already a full URL, return as is
    if (baseUrl.startsWith('http')) return baseUrl;
    
    // If it's a path, construct the appropriate size URL
    const sizeMap = {
      small: 'thumb',
      medium: 'medium', 
      large: 'large',
      xlarge: 'xlarge'
    };
    
    const sizeName = sizeMap[size];
    
    // Construct the full Supabase storage URL
    const fullUrl = `https://xzcmkssadekswmiqfbff.supabase.co/storage/v1/object/public/avatars/${baseUrl}/${sizeName}.jpg`;
    
    // Debug logging
    console.log('Avatar URL Debug:', {
      baseUrl,
      size,
      sizeName,
      fullUrl
    });
    
    return fullUrl;
  };

  const displayUrl = getAvatarUrl(avatarUrl);

  const handleImageError = () => {
    console.error('Avatar image failed to load:', displayUrl);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('Avatar image loaded successfully:', displayUrl);
    setImageLoaded(true);
    setImageError(false);
  };

  const handlePlaceholderError = () => {
    console.error('Placeholder image failed to load');
    setPlaceholderError(true);
  };

  const handlePlaceholderLoad = () => {
    console.log('Placeholder image loaded successfully');
  };

  return (
    <div className={`relative ${getSizeClass()} bg-gradient-to-r from-rap-gold to-rap-gold-light rounded-full flex items-center justify-center shadow-lg border-2 border-rap-gold/50`}>
      {displayUrl && !imageError ? (
        <img 
          src={displayUrl} 
          alt="Avatar" 
          className="w-full h-full rounded-full object-cover"
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{ 
            opacity: imageLoaded ? 1 : 0.5,
            transition: 'opacity 0.3s ease'
          }}
        />
      ) : !placeholderError ? (
        <img 
          src={placeholderImageUrl} 
          alt="Default Avatar" 
          className="w-full h-full rounded-full object-cover"
          onError={handlePlaceholderError}
          onLoad={handlePlaceholderLoad}
        />
      ) : (
        <User className="w-1/2 h-1/2 text-rap-silver" />
      )}
      
      {/* Loading indicator */}
      {displayUrl && !imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-rap-carbon/50 rounded-full">
          <div className="w-4 h-4 border-2 border-rap-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default AvatarDisplay;
