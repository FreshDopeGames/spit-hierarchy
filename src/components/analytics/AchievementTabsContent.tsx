import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Lock } from "lucide-react";
import AchievementCard from "@/components/achievements/AchievementCard";
import AchievementEmptyState from "./AchievementEmptyState";
import { Achievement } from "./types/achievementTypes";
import { sortAchievementsByRarity } from "@/utils/achievementUtils";

interface AchievementTabsContentProps {
  achievements: Achievement[];
  earnedAchievements: Achievement[];
  unlockedAchievements: Achievement[];
}

const AchievementTabsContent = ({ 
  achievements, 
  earnedAchievements, 
  unlockedAchievements 
}: AchievementTabsContentProps) => {
  // Sort all achievement lists from least rare to most rare
  const sortedAchievements = sortAchievementsByRarity([...achievements]);
  const sortedEarned = sortAchievementsByRarity([...earnedAchievements]);
  // Use all achievements for progress/locked filtering to ensure accuracy:
  const notEarned = achievements.filter(a => !a.is_earned);

  // Updated logic: "progress" means not earned and progress between 0 and 100
  const inProgress = sortAchievementsByRarity([
    ...notEarned.filter(a => {
      const pct = Number(a.progress_percentage) || 0;
      return pct > 0 && pct < 100;
    })
  ]);

  // "locked" means not earned and no progress yet
  const locked = sortAchievementsByRarity([
    ...notEarned.filter(a => {
      const pct = Number(a.progress_percentage) || 0;
      return pct === 0;
    })
  ]);

  // Transform achievement data to match AchievementCard expectations
  const transformAchievement = (achievement: Achievement) => ({
    id: achievement.id,
    name: achievement.name,
    description: achievement.description,
    icon: achievement.icon,
    rarity: achievement.rarity as 'common' | 'rare' | 'epic' | 'legendary',
    points: achievement.points,
    is_earned: achievement.is_earned,
    progress_percentage: achievement.progress_percentage,
    earned_at: achievement.earned_at || undefined
  });

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-rap-carbon-light border border-rap-gold/30">
        <TabsTrigger 
          value="all" 
          className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon text-rap-platinum text-xs sm:text-sm"
        >
          All
        </TabsTrigger>
        <TabsTrigger 
          value="earned" 
          className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon text-rap-platinum text-xs sm:text-sm"
        >
          <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          Earned
        </TabsTrigger>
        <TabsTrigger 
          value="progress" 
          className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon text-rap-platinum text-xs sm:text-sm"
        >
          <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          In Progress
        </TabsTrigger>
        <TabsTrigger 
          value="locked" 
          className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon text-rap-platinum text-xs sm:text-sm"
        >
          <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          Locked
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-4 sm:mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {sortedAchievements.map((achievement) => (
            <AchievementCard 
              key={achievement.id} 
              achievement={transformAchievement(achievement)} 
              showProgress={true}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="earned" className="mt-4 sm:mt-6">
        {sortedEarned.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {sortedEarned.map((achievement) => (
              <AchievementCard 
                key={achievement.id} 
                achievement={transformAchievement(achievement)} 
                showProgress={false}
              />
            ))}
          </div>
        ) : (
          <AchievementEmptyState type="earned" />
        )}
      </TabsContent>

      <TabsContent value="progress" className="mt-4 sm:mt-6">
        {inProgress.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {inProgress.map((achievement) => (
              <AchievementCard 
                key={achievement.id} 
                achievement={transformAchievement(achievement)} 
                showProgress={true}
              />
            ))}
          </div>
        ) : (
          <AchievementEmptyState type="progress" />
        )}
      </TabsContent>

      <TabsContent value="locked" className="mt-4 sm:mt-6">
        {locked.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {locked.map((achievement) => (
              <AchievementCard 
                key={achievement.id} 
                achievement={transformAchievement(achievement)} 
                showProgress={true}
              />
            ))}
          </div>
        ) : (
          <AchievementEmptyState type="locked" />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default AchievementTabsContent;
