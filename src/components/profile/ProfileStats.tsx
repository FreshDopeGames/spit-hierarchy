
import React from "react";

interface ProfileStatsProps {
  memberStats: any;
}

const formatMemberSince = (dateString: string): string => {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
};

const ProfileStats = ({ memberStats }: ProfileStatsProps) => {
  if (!memberStats) return null;

  return (
    <div className="bg-black border border-rap-gold/30 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg shadow-rap-gold/20">
      <h3 className="text-lg sm:text-xl font-bold text-rap-gold font-merienda mb-4 text-center">
        Stats
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
        <div className="text-center p-3 sm:p-4 bg-rap-carbon/30 rounded-lg border border-rap-gold/20">
          <div className="text-xl sm:text-2xl font-extrabold text-rap-gold font-merienda">
            {memberStats.total_votes || 0}
          </div>
          <div className="text-xs sm:text-sm text-rap-smoke font-merienda">
            Total Votes
          </div>
        </div>
        <div className="text-center p-3 sm:p-4 bg-rap-carbon/30 rounded-lg border border-rap-gold/20">
          <div className="text-xl sm:text-2xl font-extrabold text-rap-forest font-merienda">
            {memberStats.total_comments || 0}
          </div>
          <div className="text-xs sm:text-sm text-rap-smoke font-merienda">
            Comments
          </div>
        </div>
        <div className="text-center p-3 sm:p-4 bg-rap-carbon/30 rounded-lg border border-rap-gold/20">
          <div className="text-xl sm:text-2xl font-extrabold text-rap-burgundy font-merienda">
            {memberStats.consecutive_voting_days || 0}
          </div>
          <div className="text-xs sm:text-sm text-rap-smoke font-merienda">
            Voting Streak
          </div>
        </div>
        <div className="text-center p-3 sm:p-4 bg-rap-carbon/30 rounded-lg border border-rap-gold/20">
          <div className="text-xl sm:text-2xl font-extrabold text-rap-platinum font-merienda">
            {formatMemberSince(memberStats.created_at)}
          </div>
          <div className="text-xs sm:text-sm text-rap-smoke font-merienda">
            Member Since
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;
