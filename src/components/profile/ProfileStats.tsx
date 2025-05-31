
import React from "react";

interface ProfileStatsProps {
  memberStats: any;
}

const ProfileStats = ({ memberStats }: ProfileStatsProps) => {
  if (!memberStats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-rap-gold/30">
      <div className="text-center">
        <div className="text-2xl font-bold text-rap-gold font-mogra">{memberStats.total_votes || 0}</div>
        <div className="text-sm text-rap-smoke font-kaushan">Total Votes</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-rap-forest font-mogra">{memberStats.total_comments || 0}</div>
        <div className="text-sm text-rap-smoke font-kaushan">Comments</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-rap-burgundy font-mogra">{memberStats.consecutive_voting_days || 0}</div>
        <div className="text-sm text-rap-smoke font-kaushan">Voting Streak</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-rap-silver font-mogra capitalize">{memberStats.status || 'Bronze'}</div>
        <div className="text-sm text-rap-smoke font-kaushan">Member Status</div>
      </div>
    </div>
  );
};

export default ProfileStats;
