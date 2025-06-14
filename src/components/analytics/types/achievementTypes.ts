
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  threshold_value: number;
  progress_value: number;
  progress_percentage: number;
  is_earned: boolean;
  earned_at: string | null;
  rarity: string;
}

export interface AchievementStats {
  earnedCount: number;
  totalCount: number;
  totalPoints: number;
}
