import React, { useState } from "react";
import { Calendar, MapPin, Crown, Star } from "lucide-react";
import { format } from "date-fns";
import AvatarUpload from "../AvatarUpload";
import { Progress } from "@/components/ui/progress";
import { useMemberStatus } from "@/hooks/useMemberStatus";
interface ProfileHeaderProps {
  user: any;
  profile: any;
  memberStats: any;
}
const ProfileHeader = ({
  user,
  profile,
  memberStats
}: ProfileHeaderProps) => {
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url);
  const {
    currentStatus,
    totalPoints,
    getProgressToNextLevel,
    getVoteMultiplier,
    getStatusColor
  } = useMemberStatus();
  const handleAvatarUpdate = (newUrl: string) => {
    setAvatarUrl(newUrl);
  };
  const progress = getProgressToNextLevel();
  const voteMultiplier = getVoteMultiplier();
  return <div className="bg-[var(--theme-surface)] border border-[var(--theme-primary)]/30 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg shadow-[var(--theme-primary)]/20 bg-black">
      <div className="flex flex-col lg:flex-row items-start lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
        <div className="flex-shrink-0 mx-auto lg:mx-0">
          <AvatarUpload currentAvatarUrl={avatarUrl} onAvatarUpdate={handleAvatarUpdate} userId={user.id} />
        </div>
        
        <div className="flex-1 text-center lg:text-left w-full">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-10">
            {/* User Info Section */}
            <div className="flex-1 lg:flex-shrink">
              <h2 className="font-[var(--theme-fontSecondary)] text-[var(--theme-primary)] mb-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold break-words text-yellow-600">
                {profile?.username || profile?.full_name || user.email}
              </h2>
              
              {profile?.bio && <p className="text-[var(--theme-text)] mb-4 font-[var(--theme-fontSecondary)] text-sm sm:text-base">
                  {profile.bio}
                </p>}
              
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-[var(--theme-textMuted)] justify-center lg:justify-start">
                {profile?.location && <div className="flex items-center justify-center lg:justify-start gap-1">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{profile.location}</span>
                  </div>}
                <div className="flex items-center justify-center lg:justify-start gap-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Joined {format(new Date(profile?.created_at || user.created_at), 'MMMM yyyy')}</span>
                </div>
              </div>
            </div>

            {/* Member Status Section */}
            {memberStats && <div className="flex-shrink-0 text-center lg:text-right lg:min-w-72">
                <div className="flex items-center justify-center lg:justify-end mb-2">
                  <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--theme-primary)] mr-2" />
                  <h3 className="text-sm sm:text-base font-bold text-[var(--theme-primary)] font-[var(--theme-fontSecondary)] text-yellow-600">
                    Member Status
                  </h3>
                </div>
                
                <div className={`text-xl sm:text-2xl font-extrabold font-[var(--theme-fontSecondary)] capitalize ${getStatusColor(currentStatus)} mb-2`}>
                  {currentStatus}
                </div>

                {/* Vote Multiplier Badge */}
                <div className="flex items-center justify-center lg:justify-end mb-3">
                  <div className="bg-gradient-to-r from-[var(--theme-primary)]-to-[var(--theme-secondary)] px-2 py-1 rounded-full">
                    <div className="flex items-center gap-1 text-[var(--theme-background)] font-bold text-xs">
                      <Star className="w-3 h-3" />
                      <span>{voteMultiplier}x Vote Power</span>
                    </div>
                  </div>
                </div>

                {/* Points Display */}
                <div className="mb-3">
                  <div className="text-[var(--theme-text)] text-xs font-[var(--theme-fontSecondary)]">
                    Achievement Points
                  </div>
                  <div className="text-[var(--theme-primary)] font-bold text-lg font-[var(--theme-fontSecondary)]">
                    {totalPoints}
                  </div>
                </div>

                {/* Progress to Next Level */}
                {progress.nextLevel && <div className="space-y-2 max-w-64 mx-auto lg:mx-0 lg:ml-auto">
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--theme-text)] font-[var(--theme-fontSecondary)] truncate">
                        To {progress.nextLevel}
                      </span>
                      <span className="text-[var(--theme-primary)] font-[var(--theme-fontSecondary)] font-bold">
                        {progress.pointsToNext}
                      </span>
                    </div>
                    <Progress value={progress.percentage} className="w-full h-3" />
                    <div className="text-xs text-[var(--theme-textMuted)] text-center font-[var(--theme-fontSecondary)]">
                      {Math.round(progress.percentage)}% complete
                    </div>
                  </div>}

                {currentStatus === 'diamond' && <div className="text-xs text-[var(--theme-accent)] font-[var(--theme-fontSecondary)] font-bold mt-2">
                    🎉 Maximum level achieved!
                  </div>}
              </div>}
          </div>
        </div>
      </div>
    </div>;
};
export default ProfileHeader;