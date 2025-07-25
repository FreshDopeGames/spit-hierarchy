import React, { useState } from "react";
import { useAchievements } from "@/hooks/useAchievements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AchievementCard from "@/components/achievements/AchievementCard";
import AchievementTable from "@/components/achievements/AchievementTable";
import { Award, Trophy, LayoutGrid, Table } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProfileAchievements = () => {
  const { achievements, getEarnedAchievements, getTotalPoints, isLoading } = useAchievements();

  if (isLoading) {
    return (
      <Card className="bg-black border border-rap-gold/30 rounded-lg shadow-lg shadow-rap-gold/20">
        <CardHeader>
          <CardTitle className="text-rap-gold font-merienda flex items-center gap-2 text-lg sm:text-xl">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-12 sm:h-16 bg-rap-carbon/50 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-16 sm:h-20 bg-rap-carbon/50 rounded" />
              <div className="h-16 sm:h-20 bg-rap-carbon/50 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const earnedAchievements = getEarnedAchievements();
  const recentAchievements = earnedAchievements.slice(0, 4);

  // Transform achievement data to match AchievementCard expectations
  const transformAchievement = (achievement: any) => ({
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
    <Card className="bg-black border border-rap-gold/30 rounded-lg shadow-lg shadow-rap-gold/20">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-rap-gold font-merienda flex items-center gap-2 text-lg sm:text-xl">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            Achievements
          </CardTitle>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="text-center sm:text-right">
              <div className="text-rap-silver text-xs sm:text-sm">Total Points</div>
              <div className="text-rap-gold font-bold text-lg sm:text-xl">{getTotalPoints()}</div>
            </div>
            <Link to="/analytics?tab=achievements">
              <Button 
                variant="outline" 
                size="sm"
                className="border-rap-gold/30 text-rap-gold hover:bg-rap-gold hover:text-rap-carbon w-full sm:w-auto text-xs sm:text-sm"
              >
                View All Achievements
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-rap-carbon-light border border-rap-gold/30 mb-4">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon text-rap-platinum text-xs sm:text-sm"
            >
              <LayoutGrid className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Recent
            </TabsTrigger>
            <TabsTrigger 
              value="table" 
              className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon text-rap-platinum text-xs sm:text-sm"
            >
              <Table className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              All Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {recentAchievements.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {recentAchievements.map((achievement) => (
                  <AchievementCard 
                    key={achievement.id} 
                    achievement={transformAchievement(achievement)} 
                    showProgress={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <Award className="w-10 h-10 sm:w-12 sm:h-12 text-rap-gold/50 mx-auto mb-3" />
                <h3 className="text-base sm:text-lg font-bold text-rap-silver mb-2">No Achievements Yet</h3>
                <p className="text-rap-platinum text-xs sm:text-sm px-4">
                  Start voting and engaging to earn your first achievements!
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="table">
            <div className="space-y-4">
              <div className="text-sm text-rap-silver">
                Track your progress on all {achievements.length} available achievements
              </div>
              <AchievementTable 
                achievements={achievements.slice(0, 6)} 
                showProgress={true}
              />
              <div className="text-center">
                <Link to="/analytics?tab=achievements">
                  <Button 
                    variant="outline"
                    className="border-rap-gold/30 text-rap-gold hover:bg-rap-gold hover:text-rap-carbon"
                  >
                    View All Achievements
                  </Button>
                </Link>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProfileAchievements;
