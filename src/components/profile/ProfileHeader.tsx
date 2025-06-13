
import React, { useState } from "react";
import { Calendar, MapPin, User } from "lucide-react";
import { format } from "date-fns";
import AvatarUpload from "../AvatarUpload";

interface ProfileHeaderProps {
  user: any;
  profile: any;
}

const ProfileHeader = ({ user, profile }: ProfileHeaderProps) => {
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url);

  const handleAvatarUpdate = (newUrl: string) => {
    setAvatarUrl(newUrl);
  };

  return (
    <div className="bg-carbon-fiber/90 border border-rap-gold/30 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg shadow-rap-gold/20">
      <div className="flex flex-col sm:flex-row items-start sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          <AvatarUpload 
            currentAvatarUrl={avatarUrl} 
            onAvatarUpdate={handleAvatarUpdate} 
            userId={user.id} 
          />
        </div>
        
        <div className="flex-1 text-center sm:text-left w-full">
          <h2 className="font-merienda text-rap-gold mb-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold break-words">
            {profile?.full_name || profile?.username || user.email}
          </h2>
          
          {profile?.bio && (
            <p className="text-rap-platinum mb-4 font-merienda text-sm sm:text-base">
              {profile.bio}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-rap-smoke">
            {profile?.location && (
              <div className="flex items-center justify-center sm:justify-start gap-1">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{profile.location}</span>
              </div>
            )}
            <div className="flex items-center justify-center sm:justify-start gap-1">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Joined {format(new Date(profile?.created_at || user.created_at), 'MMMM yyyy')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
