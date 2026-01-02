import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface QuizBadge {
  id: string;
  name: string;
  description: string;
  category: string;
  threshold_correct: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  icon: string;
  badge_color: string | null;
  tier_level: number;
}

export interface UserQuizBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badge: QuizBadge;
}

export interface BadgeProgress {
  badge: QuizBadge;
  currentProgress: number;
  percentage: number;
  isEarned: boolean;
}

export const useQuizBadges = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  // Fetch all available quiz badges
  const { data: allBadges, isLoading: badgesLoading } = useQuery({
    queryKey: ['all-quiz-badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_badges')
        .select('*')
        .eq('is_active', true)
        .order('category')
        .order('threshold_correct');
      
      if (error) throw error;
      return data as QuizBadge[];
    },
  });

  // Fetch user's earned quiz badges
  const { data: earnedBadges, isLoading: earnedLoading } = useQuery({
    queryKey: ['user-quiz-badges', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      
      const { data, error } = await supabase
        .from('user_quiz_badges')
        .select(`
          id,
          badge_id,
          earned_at,
          badge:quiz_badges(*)
        `)
        .eq('user_id', targetUserId)
        .order('earned_at', { ascending: false });
      
      if (error) throw error;
      return data as UserQuizBadge[];
    },
    enabled: !!targetUserId,
  });

  // Fetch user's quiz stats for progress calculation
  const { data: userStats } = useQuery({
    queryKey: ['quiz-category-stats', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;
      
      // Get overall stats
      const { data: memberStats, error: memberError } = await supabase
        .from('member_stats')
        .select('quiz_correct_answers, quiz_best_streak')
        .eq('id', targetUserId)
        .single();
      
      if (memberError && memberError.code !== 'PGRST116') throw memberError;
      
      // Get category-specific stats
      const { data: categoryStats, error: categoryError } = await supabase
        .rpc('get_user_quiz_stats_by_category', { p_user_id: targetUserId });
      
      if (categoryError) throw categoryError;
      
      return {
        overall: memberStats?.quiz_correct_answers || 0,
        bestStreak: memberStats?.quiz_best_streak || 0,
        byCategory: categoryStats as Array<{
          category: string;
          total_answered: number;
          total_correct: number;
          accuracy: number;
        }> || []
      };
    },
    enabled: !!targetUserId,
  });

  // Calculate badge progress
  const getBadgeProgress = (): BadgeProgress[] => {
    if (!allBadges || !userStats) return [];
    
    const earnedBadgeIds = new Set(earnedBadges?.map(eb => eb.badge_id) || []);
    
    return allBadges.map(badge => {
      let currentProgress = 0;
      
      if (badge.category === 'overall') {
        currentProgress = userStats.overall;
      } else if (badge.category === 'streak') {
        currentProgress = userStats.bestStreak;
      } else {
        const categoryData = userStats.byCategory.find(c => c.category === badge.category);
        currentProgress = categoryData?.total_correct || 0;
      }
      
      const percentage = Math.min(100, Math.round((currentProgress / badge.threshold_correct) * 100));
      
      return {
        badge,
        currentProgress,
        percentage,
        isEarned: earnedBadgeIds.has(badge.id)
      };
    });
  };

  // Get next badges to earn (not yet earned, closest to completion)
  const getNextBadgesToEarn = (limit: number = 3): BadgeProgress[] => {
    const progress = getBadgeProgress();
    return progress
      .filter(p => !p.isEarned)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, limit);
  };

  // Get badges by category
  const getBadgesByCategory = (category: string): BadgeProgress[] => {
    return getBadgeProgress().filter(p => p.badge.category === category);
  };

  // Get rarity color
  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'legendary':
        return 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10';
      case 'epic':
        return 'text-purple-400 border-purple-400/50 bg-purple-400/10';
      case 'rare':
        return 'text-blue-400 border-blue-400/50 bg-blue-400/10';
      default:
        return 'text-gray-400 border-gray-400/50 bg-gray-400/10';
    }
  };

  const getRarityGlow = (rarity: string): string => {
    switch (rarity) {
      case 'legendary':
        return 'shadow-[0_0_20px_rgba(250,204,21,0.4)]';
      case 'epic':
        return 'shadow-[0_0_15px_rgba(168,85,247,0.4)]';
      case 'rare':
        return 'shadow-[0_0_10px_rgba(59,130,246,0.3)]';
      default:
        return '';
    }
  };

  return {
    allBadges,
    earnedBadges,
    userStats,
    isLoading: badgesLoading || earnedLoading,
    getBadgeProgress,
    getNextBadgesToEarn,
    getBadgesByCategory,
    getRarityColor,
    getRarityGlow,
    earnedCount: earnedBadges?.length || 0,
    totalBadges: allBadges?.length || 0,
  };
};
