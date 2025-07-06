
import React, { useState } from "react";
import { User } from "lucide-react";

interface SmallAvatarProps {
  avatarUrl?: string;
  username: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const SmallAvatar = ({ avatarUrl, username, size = 'sm', className = '' }: SmallAvatarProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case 'xs': return 'w-6 h-6';
      case 'sm': return 'w-8 h-8';
      case 'md': return 'w-10 h-10';
      default: return 'w-8 h-8';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'xs': return 'w-3 h-3';
      case 'sm': return 'w-4 h-4';
      case 'md': return 'w-5 h-5';
      default: return 'w-4 h-4';
    }
  };

  const getAvatarUrl = (baseUrl?: string) => {
    if (!baseUrl) return undefined;
    
    // If it's already a full URL, return as is
    if (baseUrl.startsWith('http')) return baseUrl;
    
    // Always use thumb size (128px) for small avatars - provides crisp quality when downscaled
    const fullUrl = `https://xzcmkssadekswmiqfbff.supabase.co/storage/v1/object/public/avatars/${baseUrl}/thumb.jpg?v=${Date.now()}`;
    
    console.log('Small Avatar URL:', {
      baseUrl,
      size,
      fullUrl
    });
    
    return fullUrl;
  };

  const displayUrl = getAvatarUrl(avatarUrl);

  const handleImageError = () => {
    console.error('Small avatar image failed to load:', displayUrl);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('Small avatar loaded successfully:', displayUrl);
    setImageLoaded(true);
    setImageError(false);
  };

  return (
    <div className={`${getSizeClasses()} bg-gradient-to-r from-rap-gold to-rap-gold-light rounded-full flex items-center justify-center shadow-sm border border-rap-gold/30 flex-shrink-0 ${className}`}>
      {displayUrl && !imageError ? (
        <img 
          src={displayUrl} 
          alt={username}
          className="w-full h-full rounded-full object-cover"
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{ 
            opacity: imageLoaded ? 1 : 0.8,
            transition: 'opacity 0.2s ease',
            imageRendering: 'crisp-edges'
          }}
          loading="eager"
        />
      ) : (
        <>
          {!imageError && displayUrl ? (
            // Show first letter while loading
            <span className="text-black font-bold text-xs">
              {username.charAt(0).toUpperCase()}
            </span>
          ) : (
            // Show icon fallback
            <User className={`${getIconSize()} text-rap-carbon`} />
          )}
        </>
      )}
    </div>
  );
};

export default SmallAvatar;
