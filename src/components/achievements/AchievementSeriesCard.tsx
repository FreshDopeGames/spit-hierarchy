import React from "react";
import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import { ThemedProgress as Progress } from "@/components/ui/themed-progress";
import { Achievement } from "@/components/analytics/types/achievementTypes";
import { getSeriesStats, SeriesStats } from "@/utils/achievementSeriesUtils";
import { Trophy, Target, Star } from "lucide-react";
import AchievementCard from "./AchievementCard";

interface AchievementSeriesCardProps {
  seriesName: string;
  achievements: Achievement[];
  showProgress?: boolean;
}

const AchievementSeriesCard = ({ 
  seriesName, 
  achievements,
  showProgress = true 
}: AchievementSeriesCardProps) => {
  const stats: SeriesStats = getSeriesStats(seriesName, achievements);
  const sortedAchievements = [...achievements].sort((a, b) => (a.tier_level || 0) - (b.tier_level || 0));

  const getSeriesIcon = () => {
    if (stats.completionPercentage === 100) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (stats.completionPercentage > 0) return <Target className="w-5 h-5 text-blue-500" />;
    return <Star className="w-5 h-5 text-gray-500" />;
  };

  const getCompletionColor = () => {
    if (stats.completionPercentage === 100) return "text-yellow-500";
    if (stats.completionPercentage >= 75) return "text-green-500";
    if (stats.completionPercentage >= 50) return "text-blue-500";
    if (stats.completionPercentage >= 25) return "text-orange-500";
    return "text-gray-500";
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getSeriesIcon()}
            <CardTitle className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal sm:font-medium font-ceviche text-primary">
              {seriesName}
            </CardTitle>
          </div>
          <div className={`text-right ${getCompletionColor()}`}>
            <div className="text-2xl font-bold">{stats.completionPercentage}%</div>
            <div className="text-xs text-muted-foreground">
              {stats.earnedCount}/{stats.totalAchievements} Complete
            </div>
          </div>
        </div>
        
        {showProgress && (
          <div className="mt-4 space-y-2">
            <Progress 
              value={stats.completionPercentage} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{stats.earnedPoints} / {stats.totalPoints} Points</span>
              <span>
                {stats.highestTier > 0 
                  ? `Tier ${stats.highestTier}/${sortedAchievements.length}` 
                  : `0/${sortedAchievements.length} unlocked`}
              </span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedAchievements.map((achievement) => (
            <div key={achievement.id} className="relative">
              {achievement.tier_level && (
                <div className="absolute top-2 left-2 z-10 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold">
                  Tier {achievement.tier_level}
                </div>
              )}
              <AchievementCard 
                achievement={achievement} 
                showProgress={showProgress}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementSeriesCard;
