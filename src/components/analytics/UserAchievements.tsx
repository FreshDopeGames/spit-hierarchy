import React, { useState } from "react";
import { useAchievements } from "@/hooks/useAchievements";
import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import AchievementCard from "@/components/achievements/AchievementCard";
import AchievementTable from "@/components/achievements/AchievementTable";
import AchievementGallery from "@/components/achievements/AchievementGallery";
import AchievementViewModeSelector from "./AchievementViewModeSelector";
import AchievementStatsCards from "./AchievementStatsCards";
import AchievementEmptyState from "./AchievementEmptyState";
import { Trophy, Award, Target } from "lucide-react";
const UserAchievements = () => {
  const {
    achievements,
    getEarnedAchievements,
    getTotalPoints,
    isLoading
  } = useAchievements();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  if (isLoading) {
    return <div className="space-y-4 sm:space-y-6">
        <h3 className="font-ceviche text-primary mb-3 sm:mb-4 text-4xl sm:text-6xl">
          Your Achievements
        </h3>
        <div className="animate-pulse space-y-4">
          <div className="h-12 sm:h-16 bg-rap-carbon/50 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-16 sm:h-20 bg-rap-carbon/50 rounded" />
            <div className="h-16 sm:h-20 bg-rap-carbon/50 rounded" />
          </div>
        </div>
      </div>;
  }
  const earnedAchievements = getEarnedAchievements();
  const totalPoints = getTotalPoints();
  return <div className="space-y-4 sm:space-y-6">
      <h3 className="font-ceviche text-primary mb-3 sm:mb-4 text-4xl sm:text-6xl">Achievements</h3>

      {/* Achievement Stats */}
      <AchievementStatsCards stats={{
      earnedCount: earnedAchievements.length,
      totalCount: achievements.length,
      totalPoints: totalPoints
    }} />

      {/* View Mode Selector */}
      <div className="flex justify-between items-center">
        <div className="text-rap-silver text-sm">
          Showing {achievements.length} achievements
        </div>
        <AchievementViewModeSelector viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      {/* Achievement Content */}
      {achievements.length > 0 ? <>
          {viewMode === 'cards' && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {achievements.map(achievement => <AchievementCard key={achievement.id} achievement={achievement} showProgress={true} />)}
            </div>}

          {viewMode === 'table' && <AchievementTable achievements={achievements} showProgress={true} />}
        </> : <AchievementEmptyState type="earned" />}
    </div>;
};
export default UserAchievements;