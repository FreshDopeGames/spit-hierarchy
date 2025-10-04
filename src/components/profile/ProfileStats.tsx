
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
    <div className="bg-[hsl(var(--theme-background))] border border-[hsl(var(--theme-primary))]/30 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg shadow-[hsl(var(--theme-primary))]/20">
      <h3 className="text-lg sm:text-xl font-bold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)] mb-4 text-center">
        Stats
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
        <div className="text-center p-3 sm:p-4 bg-[hsl(var(--theme-surface))]/30 rounded-lg border border-[hsl(var(--theme-primary))]/20">
          <div className="text-xl sm:text-2xl font-extrabold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)]">
            {memberStats.total_votes || 0}
          </div>
          <div className="text-xs sm:text-sm text-[hsl(var(--theme-textMuted))] font-[var(--theme-font-heading)]">
            Total Votes
          </div>
        </div>
        <div className="text-center p-3 sm:p-4 bg-[hsl(var(--theme-surface))]/30 rounded-lg border border-[hsl(var(--theme-primary))]/20">
          <div className="text-xl sm:text-2xl font-extrabold text-[hsl(var(--theme-secondary))] font-[var(--theme-font-heading)]">
            {memberStats.total_comments || 0}
          </div>
          <div className="text-xs sm:text-sm text-[hsl(var(--theme-textMuted))] font-[var(--theme-font-heading)]">
            Comments
          </div>
        </div>
        <div className="text-center p-3 sm:p-4 bg-[hsl(var(--theme-surface))]/30 rounded-lg border border-[hsl(var(--theme-primary))]/20">
          <div className="text-xl sm:text-2xl font-extrabold text-[hsl(var(--theme-accent))] font-[var(--theme-font-heading)]">
            {memberStats.consecutive_voting_days || 0}
          </div>
          <div className="text-xs sm:text-sm text-[hsl(var(--theme-textMuted))] font-[var(--theme-font-heading)]">
            Voting Streak
          </div>
        </div>
        <div className="text-center p-3 sm:p-4 bg-[hsl(var(--theme-surface))]/30 rounded-lg border border-[hsl(var(--theme-primary))]/20">
          <div className="text-xl sm:text-2xl font-extrabold text-[hsl(var(--theme-text))] font-[var(--theme-font-heading)]">
            {formatMemberSince(memberStats.created_at)}
          </div>
          <div className="text-xs sm:text-sm text-[hsl(var(--theme-textMuted))] font-[var(--theme-font-heading)]">
            Member Since
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;
