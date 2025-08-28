import React, { useState } from "react";
import { useAchievements } from "@/hooks/useAchievements";
import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
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
      <Card className="bg-[var(--theme-background)] border border-[var(--theme-primary)]/30 rounded-lg shadow-lg shadow-[var(--theme-primary)]/20">
        <CardHeader>
          <CardTitle className="text-[var(--theme-primary)] font-[var(--theme-font-heading)] flex items-center gap-2 text-lg sm:text-xl">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-12 sm:h-16 bg-[var(--theme-surface)] rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-16 sm:h-20 bg-[var(--theme-surface)] rounded" />
              <div className="h-16 sm:h-20 bg-[var(--theme-surface)] rounded" />
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
    <Card className="bg-[var(--theme-background)] border border-[var(--theme-primary)]/30 rounded-lg shadow-lg shadow-[var(--theme-primary)]/20">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-[var(--theme-primary)] font-[var(--theme-font-heading)] flex items-center gap-2 text-lg sm:text-xl">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            Achievements
          </CardTitle>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="text-center sm:text-right">
              <div className="text-[var(--theme-secondary)] text-xs sm:text-sm">Total Points</div>
              <div className="text-[var(--theme-primary)] font-bold text-lg sm:text-xl">{getTotalPoints()}</div>
            </div>
            <Link to="/analytics?tab=achievements">
              <Button 
                variant="outline" 
                size="sm"
                className="border-[var(--theme-primary)]/30 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)] hover:text-[var(--theme-background)] w-full sm:w-auto text-xs sm:text-sm"
              >
                View All Achievements
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[var(--theme-background)] border border-[var(--theme-primary)]/30 mb-4">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-[var(--theme-background)] text-[var(--theme-text)] text-xs sm:text-sm"
            >
              <LayoutGrid className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Recent
            </TabsTrigger>
            <TabsTrigger 
              value="table" 
              className="data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-[var(--theme-background)] text-[var(--theme-text)] text-xs sm:text-sm"
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
                <Award className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--theme-primary)]/50 mx-auto mb-3" />
                <h3 className="text-base sm:text-lg font-bold text-[var(--theme-secondary)] mb-2">No Achievements Yet</h3>
                <p className="text-[var(--theme-text)] text-xs sm:text-sm px-4">
                  Start voting and engaging to earn your first achievements!
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="table">
            <div className="space-y-4">
              <div className="text-sm text-[var(--theme-secondary)]">
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
                    className="border-[var(--theme-primary)]/30 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)] hover:text-[var(--theme-background)]"
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
