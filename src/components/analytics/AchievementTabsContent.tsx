
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Lock } from "lucide-react";
import AchievementCard from "@/components/achievements/AchievementCard";
import AchievementEmptyState from "./AchievementEmptyState";
import { Achievement } from "./types/achievementTypes";

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
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-carbon-fiber border border-rap-gold/30">
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
          {achievements.map((achievement) => (
            <AchievementCard 
              key={achievement.id} 
              achievement={achievement} 
              showProgress={true}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="earned" className="mt-4 sm:mt-6">
        {earnedAchievements.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {earnedAchievements.map((achievement) => (
              <AchievementCard 
                key={achievement.id} 
                achievement={achievement} 
                showProgress={false}
              />
            ))}
          </div>
        ) : (
          <AchievementEmptyState type="earned" />
        )}
      </TabsContent>

      <TabsContent value="progress" className="mt-4 sm:mt-6">
        {unlockedAchievements.filter(a => a.progress_percentage > 0).length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {unlockedAchievements
              .filter(a => a.progress_percentage > 0)
              .sort((a, b) => b.progress_percentage - a.progress_percentage)
              .map((achievement) => (
                <AchievementCard 
                  key={achievement.id} 
                  achievement={achievement} 
                  showProgress={true}
                />
              ))}
          </div>
        ) : (
          <AchievementEmptyState type="progress" />
        )}
      </TabsContent>

      <TabsContent value="locked" className="mt-4 sm:mt-6">
        {unlockedAchievements.filter(a => a.progress_percentage === 0).length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {unlockedAchievements
              .filter(a => a.progress_percentage === 0)
              .sort((a, b) => a.points - b.points)
              .map((achievement) => (
                <AchievementCard 
                  key={achievement.id} 
                  achievement={achievement} 
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
