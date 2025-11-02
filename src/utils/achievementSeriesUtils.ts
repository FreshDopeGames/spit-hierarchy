import { Achievement } from "@/components/analytics/types/achievementTypes";

/**
 * Groups achievements by their series_name
 */
export const groupAchievementsBySeries = (achievements: Achievement[]) => {
  const series: Record<string, Achievement[]> = {};
  
  achievements.forEach(achievement => {
    const seriesName = achievement.series_name || 'Standalone';
    if (!series[seriesName]) {
      series[seriesName] = [];
    }
    series[seriesName].push(achievement);
  });
  
  // Sort achievements within each series by tier_level
  Object.keys(series).forEach(seriesName => {
    series[seriesName].sort((a, b) => (a.tier_level || 0) - (b.tier_level || 0));
  });
  
  return series;
};

/**
 * Gets the next tier achievement in a series
 */
export const getNextTierAchievement = (
  achievement: Achievement,
  allAchievements: Achievement[]
): Achievement | null => {
  if (!achievement.series_name) return null;
  
  const seriesAchievements = allAchievements
    .filter(a => a.series_name === achievement.series_name)
    .sort((a, b) => (a.tier_level || 0) - (b.tier_level || 0));
  
  const currentIndex = seriesAchievements.findIndex(a => a.id === achievement.id);
  
  if (currentIndex === -1 || currentIndex === seriesAchievements.length - 1) {
    return null;
  }
  
  return seriesAchievements[currentIndex + 1];
};

/**
 * Calculates series completion percentage
 */
export const getSeriesCompletionPercentage = (
  seriesName: string,
  achievements: Achievement[]
): number => {
  const seriesAchievements = achievements.filter(a => a.series_name === seriesName);
  if (seriesAchievements.length === 0) return 0;
  
  const earnedCount = seriesAchievements.filter(a => a.is_earned).length;
  return Math.round((earnedCount / seriesAchievements.length) * 100);
};

/**
 * Gets the highest tier earned in a series
 */
export const getHighestTierEarned = (
  seriesName: string,
  achievements: Achievement[]
): number => {
  const earnedInSeries = achievements
    .filter(a => a.series_name === seriesName && a.is_earned)
    .map(a => a.tier_level || 0);
  
  return earnedInSeries.length > 0 ? Math.max(...earnedInSeries) : 0;
};

/**
 * Gets achievements currently in progress (0 < progress < 100)
 */
export const getInProgressAchievements = (achievements: Achievement[]): Achievement[] => {
  return achievements.filter(
    a => !a.is_earned && a.progress_percentage > 0 && a.progress_percentage < 100
  );
};

/**
 * Formats achievement progress message for next tier
 */
export const getNextTierProgressMessage = (
  achievement: Achievement,
  nextTier: Achievement | null
): string | null => {
  if (!nextTier || achievement.is_earned) return null;
  
  const pointsNeeded = nextTier.threshold_value - achievement.progress_value;
  return `${pointsNeeded} more to unlock ${nextTier.name}`;
};

/**
 * Gets series statistics
 */
export interface SeriesStats {
  totalAchievements: number;
  earnedCount: number;
  totalPoints: number;
  earnedPoints: number;
  completionPercentage: number;
  highestTier: number;
}

export const getSeriesStats = (
  seriesName: string,
  achievements: Achievement[]
): SeriesStats => {
  // Handle special case for standalone achievements
  const seriesAchievements = (seriesName === 'Special Achievements' || seriesName === 'Standalone')
    ? achievements.filter(a => !a.series_name || a.series_name === null)
    : achievements.filter(a => a.series_name === seriesName);
  
  const earnedAchievements = seriesAchievements.filter(a => a.is_earned);
  
  // Safety check to prevent division by zero
  const completionPercentage = seriesAchievements.length > 0 
    ? Math.round((earnedAchievements.length / seriesAchievements.length) * 100)
    : 0;
  
  return {
    totalAchievements: seriesAchievements.length,
    earnedCount: earnedAchievements.length,
    totalPoints: seriesAchievements.reduce((sum, a) => sum + a.points, 0),
    earnedPoints: earnedAchievements.reduce((sum, a) => sum + a.points, 0),
    completionPercentage,
    highestTier: getHighestTierEarned(seriesName, achievements)
  };
};
