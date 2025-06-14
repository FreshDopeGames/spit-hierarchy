
import React, { useState } from "react";
import { useAchievements } from "@/hooks/useAchievements";
import AchievementTable from "@/components/achievements/AchievementTable";
import AchievementStatsCards from "./AchievementStatsCards";
import AchievementViewModeSelector from "./AchievementViewModeSelector";
import AchievementTabsContent from "./AchievementTabsContent";

const UserAchievements = () => {
  const { achievements, isLoading, getEarnedAchievements, getUnlockedAchievements, getTotalPoints } = useAchievements();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 sm:h-32 bg-carbon-fiber/40 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 sm:h-24 bg-carbon-fiber/40 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const earnedAchievements = getEarnedAchievements();
  const unlockedAchievements = getUnlockedAchievements();

  const stats = {
    earnedCount: earnedAchievements.length,
    totalCount: achievements.length,
    totalPoints: getTotalPoints()
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg sm:text-2xl mb-0 text-rap-gold font-extrabold">
          Your Achievements
        </h3>
        
        <AchievementViewModeSelector 
          viewMode={viewMode} 
          onViewModeChange={setViewMode} 
        />
      </div>
      
      <AchievementStatsCards stats={stats} />

      {viewMode === 'table' ? (
        <div className="space-y-4">
          <AchievementTable achievements={achievements} showProgress={true} />
        </div>
      ) : (
        <AchievementTabsContent 
          achievements={achievements}
          earnedAchievements={earnedAchievements}
          unlockedAchievements={unlockedAchievements}
        />
      )}
    </div>
  );
};

export default UserAchievements;
