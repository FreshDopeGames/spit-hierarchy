import React from "react";

interface ProfileStatsProps {
  memberStats: any;
  publicStats?: {
    rappers_ranked: number;
    rappers_rated: number;
    bars_upvotes: number;
    vs_match_votes: number;
    total_achievements: number;
  } | null;
}

const ProfileStats = ({ memberStats, publicStats }: ProfileStatsProps) => {
  if (!memberStats) return null;

  // Calculate quiz accuracy
  const quizQuestionsAnswered = memberStats.quiz_questions_answered || 0;
  const quizCorrectAnswers = memberStats.quiz_correct_answers || 0;
  const quizAccuracy = quizQuestionsAnswered > 0 
    ? Math.round((quizCorrectAnswers / quizQuestionsAnswered) * 100) 
    : 0;

  return (
    <div className="bg-black border-[hsl(var(--theme-primary))] border-4 shadow-lg shadow-[var(--theme-primary)]/20 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
      <h3 className="text-lg sm:text-xl font-bold text-[hsl(var(--theme-primary))] font-mogra mb-4 text-center">
        Stats
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="text-center p-3 sm:p-4 bg-[hsl(var(--theme-surface))]/30 rounded-lg border border-[hsl(var(--theme-primary))]/20">
          <div className="text-xl sm:text-2xl font-extrabold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)]">
            {publicStats?.rappers_ranked || 0}
          </div>
          <div className="text-xs sm:text-sm text-[hsl(var(--theme-textMuted))] font-[var(--theme-font-body)]">
            Rappers Ranked
          </div>
        </div>

        <div className="text-center p-3 sm:p-4 bg-[hsl(var(--theme-surface))]/30 rounded-lg border border-[hsl(var(--theme-primary))]/20">
          <div className="text-xl sm:text-2xl font-extrabold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)]">
            {publicStats?.rappers_rated || 0}
          </div>
          <div className="text-xs sm:text-sm text-[hsl(var(--theme-textMuted))] font-[var(--theme-font-body)]">
            Rappers Rated
          </div>
        </div>

        <div className="text-center p-3 sm:p-4 bg-[hsl(var(--theme-surface))]/30 rounded-lg border border-[hsl(var(--theme-primary))]/20">
          <div className="text-xl sm:text-2xl font-extrabold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)]">
            {publicStats?.bars_upvotes || 0}
          </div>
          <div className="text-xs sm:text-sm text-[hsl(var(--theme-textMuted))] font-[var(--theme-font-body)]">
            Bars
          </div>
        </div>

        <div className="text-center p-3 sm:p-4 bg-[hsl(var(--theme-surface))]/30 rounded-lg border border-[hsl(var(--theme-primary))]/20">
          <div className="text-xl sm:text-2xl font-extrabold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)]">
            {publicStats?.vs_match_votes || 0}
          </div>
          <div className="text-xs sm:text-sm text-[hsl(var(--theme-textMuted))] font-[var(--theme-font-body)]">
            VS Match Votes
          </div>
        </div>

        <div className="text-center p-3 sm:p-4 bg-[hsl(var(--theme-surface))]/30 rounded-lg border border-[hsl(var(--theme-primary))]/20">
          <div className="text-xl sm:text-2xl font-extrabold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)]">
            {publicStats?.total_achievements || 0}
          </div>
          <div className="text-xs sm:text-sm text-[hsl(var(--theme-textMuted))] font-[var(--theme-font-body)]">
            Total Achievements
          </div>
        </div>

        <div className="text-center p-3 sm:p-4 bg-[hsl(var(--theme-surface))]/30 rounded-lg border border-[hsl(var(--theme-primary))]/20">
          <div className="text-xl sm:text-2xl font-extrabold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)]">
            {quizAccuracy}%
          </div>
          <div className="text-xs sm:text-sm text-[hsl(var(--theme-textMuted))] font-[var(--theme-font-body)]">
            Quiz Accuracy
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;
