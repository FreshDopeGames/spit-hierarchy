
import React from "react";
import { User } from "lucide-react";

interface AvatarDisplayProps {
  avatarUrl?: string;
  size: 'small' | 'medium' | 'large';
}

const AvatarDisplay = ({ avatarUrl, size }: AvatarDisplayProps) => {
  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'w-8 h-8';
      case 'medium': return 'w-16 h-16';
      case 'large': return 'w-24 h-24';
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
      large: 'large'
    };
    
    const sizeName = sizeMap[size];
    
    // Construct the full Supabase storage URL
    return `https://xzcmkssadekswmiqfbff.supabase.co/storage/v1/object/public/avatars/${baseUrl}/${sizeName}.jpg`;
  };

  const displayUrl = getAvatarUrl(avatarUrl);

  return (
    <div className={`relative ${getSizeClass()} bg-gradient-to-r from-rap-burgundy to-rap-forest rounded-full flex items-center justify-center shadow-lg border-2 border-rap-gold/50`}>
      {displayUrl ? (
        <img 
          src={displayUrl} 
          alt="Avatar" 
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <User className="w-1/2 h-1/2 text-rap-silver" />
      )}
    </div>
  );
};

export default AvatarDisplay;
