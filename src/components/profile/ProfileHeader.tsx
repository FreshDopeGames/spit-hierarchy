import React, { useState } from "react";
import { Calendar, MapPin, User } from "lucide-react";
import { format } from "date-fns";
import AvatarUpload from "../AvatarUpload";
interface ProfileHeaderProps {
  user: any;
  profile: any;
}
const ProfileHeader = ({
  user,
  profile
}: ProfileHeaderProps) => {
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url);
  const handleAvatarUpdate = (newUrl: string) => {
    setAvatarUrl(newUrl);
  };
  return <div className="bg-carbon-fiber/90 border border-rap-gold/30 rounded-lg p-6 mb-8 shadow-lg shadow-rap-gold/20">
      <div className="flex items-start space-x-6">
        <AvatarUpload currentAvatarUrl={avatarUrl} onAvatarUpdate={handleAvatarUpdate} userId={user.id} />
        
        <div className="flex-1">
          <h2 className="font-mogra text-rap-gold mb-2 text-4xl">
            {profile?.full_name || profile?.username || user.email}
          </h2>
          
          {profile?.bio && <p className="text-rap-platinum mb-4 font-merienda ">{profile.bio}</p>}
          
          <div className="flex flex-wrap gap-4 text-sm text-rap-smoke">
            {profile?.location && <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{profile.location}</span>
              </div>}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Joined {format(new Date(profile?.created_at || user.created_at), 'MMMM yyyy')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default ProfileHeader;