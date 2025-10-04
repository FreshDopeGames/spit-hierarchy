import React, { useState } from "react";
import { useAchievements } from "@/hooks/useAchievements";
import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import AchievementCard from "@/components/achievements/AchievementCard";
import AchievementTable from "@/components/achievements/AchievementTable";
import { Award, Trophy, LayoutGrid, Table } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemedTabs, ThemedTabsContent, ThemedTabsList, ThemedTabsTrigger } from "@/components/ui/themed-tabs";
const ProfileAchievements = () => {
  const {
    achievements,
    getEarnedAchievements,
    getTotalPoints,
    isLoading
  } = useAchievements();
  if (isLoading) {
    return <Card className="bg-[hsl(var(--theme-background))] border border-[hsl(var(--theme-primary))]/30 rounded-lg shadow-lg shadow-[hsl(var(--theme-primary))]/20">
        <CardHeader>
          <CardTitle className="text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)] flex items-center gap-2 text-lg sm:text-xl">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-12 sm:h-16 bg-[hsl(var(--theme-surface))] rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-16 sm:h-20 bg-[hsl(var(--theme-surface))] rounded" />
              <div className="h-16 sm:h-20 bg-[hsl(var(--theme-surface))] rounded" />
            </div>
          </div>
        </CardContent>
      </Card>;
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
  return <Card className="bg-[hsl(var(--theme-background))] border border-[hsl(var(--theme-primary))]/30 rounded-lg shadow-lg shadow-[hsl(var(--theme-primary))]/20">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)] flex items-center gap-2 text-lg sm:text-xl">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            Achievements
          </CardTitle>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="text-center sm:text-right">
              <div className="text-[hsl(var(--theme-secondary))] text-xs sm:text-sm">Total Points</div>
              <div className="text-[hsl(var(--theme-primary))] font-bold text-lg sm:text-xl">{getTotalPoints()}</div>
            </div>
            <Link to="/analytics?tab=achievements">
              <Button variant="outline" size="sm" className="border-[hsl(var(--theme-primary))]/30 text-[hsl(var(--theme-primary))] hover:bg-[hsl(var(--theme-primary))] hover:text-[hsl(var(--theme-background))] w-full sm:w-auto text-xs sm:text-sm">
                View All Achievements
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ThemedTabs defaultValue="overview" className="w-full">
          <ThemedTabsList className="grid w-full grid-cols-2 mb-4">
            <ThemedTabsTrigger value="overview" className="text-xs sm:text-sm">
              <LayoutGrid className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Recent
            </ThemedTabsTrigger>
            <ThemedTabsTrigger value="table" className="text-xs sm:text-sm">
              <Table className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              All Progress
            </ThemedTabsTrigger>
          </ThemedTabsList>

          <ThemedTabsContent value="overview">
            {recentAchievements.length > 0 ? <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {recentAchievements.map(achievement => <AchievementCard key={achievement.id} achievement={transformAchievement(achievement)} showProgress={false} />)}
              </div> : <div className="text-center py-6 sm:py-8">
                <Award className="w-10 h-10 sm:w-12 sm:h-12 text-[hsl(var(--theme-primary))]/50 mx-auto mb-3" />
                <h3 className="text-base sm:text-lg font-bold text-[hsl(var(--theme-secondary))] mb-2">No Achievements Yet</h3>
                <p className="text-[hsl(var(--theme-text))] text-xs sm:text-sm px-4">
                  Start voting and engaging to earn your first achievements!
                </p>
              </div>}
          </ThemedTabsContent>

          <ThemedTabsContent value="table">
            <div className="space-y-4">
              <div className="text-sm text-[hsl(var(--theme-secondary))]">
                Track your progress on all {achievements.length} available achievements
              </div>
              <AchievementTable achievements={achievements.slice(0, 6)} showProgress={true} />
              <div className="text-center">
                <Link to="/analytics?tab=achievements">
                  <Button variant="outline" className="border-[hsl(var(--theme-primary))]/30 text-[hsl(var(--theme-primary))] hover:bg-[hsl(var(--theme-primary))] hover:text-[hsl(var(--theme-background))]">
                    View All Achievements
                  </Button>
                </Link>
              </div>
            </div>
          </ThemedTabsContent>
        </ThemedTabs>
      </CardContent>
    </Card>;
};
export default ProfileAchievements;