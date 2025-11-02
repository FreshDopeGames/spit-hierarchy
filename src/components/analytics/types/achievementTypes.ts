
export interface Achievement {
  id: string;
  achievement_id?: string; // For backward compatibility
  name: string;
  description: string;
  icon: string;
  type?: string; // For backward compatibility
  points: number;
  threshold_value: number;
  progress_value: number;
  progress_percentage: number;
  is_earned: boolean;
  earned_at: string | null;
  rarity: string;
  series_name?: string;
  tier_level?: number;
  next_tier_id?: string | null;
  badge_color?: string;
  is_hidden?: boolean;
}

export interface AchievementStats {
  earnedCount: number;
  totalCount: number;
  totalPoints: number;
}
