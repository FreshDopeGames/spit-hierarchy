
import React from "react";
import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";

interface ProfileHeaderProps {
  user: any;
  profile: any;
}

const ProfileHeader = ({ user, profile }: ProfileHeaderProps) => {
  return (
    <div className="bg-carbon-fiber/90 border border-rap-gold/30 rounded-lg p-6 mb-8 shadow-lg shadow-rap-gold/20">
      <div className="flex items-start space-x-6">
        <div className="w-20 h-20 bg-gradient-to-r from-rap-burgundy to-rap-forest rounded-full flex items-center justify-center shadow-lg">
          <span className="text-2xl font-bold text-rap-silver">
            {profile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
          </span>
        </div>
        
        <div className="flex-1">
          <h2 className="text-2xl font-mogra text-rap-gold mb-2 animate-text-glow">
            {profile?.full_name || profile?.username || user.email}
          </h2>
          
          {profile?.bio && (
            <p className="text-rap-platinum mb-4 font-kaushan">{profile.bio}</p>
          )}
          
          <div className="flex flex-wrap gap-4 text-sm text-rap-smoke">
            {profile?.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{profile.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Joined {format(new Date(profile?.created_at || user.created_at), 'MMMM yyyy')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
