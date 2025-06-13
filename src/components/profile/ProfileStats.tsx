
import React from "react";

interface ProfileStatsProps {
  memberStats: any;
}

const ProfileStats = ({ memberStats }: ProfileStatsProps) => {
  if (!memberStats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-rap-gold/30">
      <div className="text-center p-2 sm:p-0">
        <div className="text-xl sm:text-2xl font-extrabold text-rap-gold font-merienda">
          {memberStats.total_votes || 0}
        </div>
        <div className="text-xs sm:text-sm text-rap-smoke font-merienda">
          Total Votes
        </div>
      </div>
      <div className="text-center p-2 sm:p-0">
        <div className="text-xl sm:text-2xl font-extrabold text-rap-forest font-merienda">
          {memberStats.total_comments || 0}
        </div>
        <div className="text-xs sm:text-sm text-rap-smoke font-merienda">
          Comments
        </div>
      </div>
      <div className="text-center p-2 sm:p-0">
        <div className="text-xl sm:text-2xl font-extrabold text-rap-burgundy font-merienda">
          {memberStats.consecutive_voting_days || 0}
        </div>
        <div className="text-xs sm:text-sm text-rap-smoke font-merienda">
          Voting Streak
        </div>
      </div>
      <div className="text-center p-2 sm:p-0">
        <div className="text-xl sm:text-2xl font-extrabold text-rap-silver font-merienda capitalize">
          {memberStats.status || 'Bronze'}
        </div>
        <div className="text-xs sm:text-sm text-rap-smoke font-merienda">
          Member Status
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;
