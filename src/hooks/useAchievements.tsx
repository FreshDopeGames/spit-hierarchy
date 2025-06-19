
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAdaptivePolling } from './useAdaptivePolling';
import { sortAchievementsByRarity } from '@/utils/achievementUtils';
import { showAchievementToast } from '@/components/achievements/AchievementToast';

export const useAchievements = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newAchievements, setNewAchievements] = useState<any[]>([]);
  
  const { refetchInterval, refetchIntervalInBackground } = useAdaptivePolling({
    baseInterval: 60000, // Reduced frequency for achievements - 1 minute
    maxInterval: 600000, // Max 10 minutes
    enabled: !!user
  });

  // Fetch ALL achievements combined with user progress
  const { data: achievementsData, isLoading } = useQuery({
    queryKey: ['user-achievement-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_achievement_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    refetchInterval,
    refetchIntervalInBackground,
    staleTime: 5 * 60 * 1000, // 5 minutes - achievements don't change frequently
    refetchOnWindowFocus: false,
  });

  // Sort the achievements for consistent display
  const achievements = sortAchievementsByRarity(achievementsData || []);

  // Check for new achievements periodically
  const checkForNewAchievements = async () => {
    if (!user) return;
    
    try {
      // Trigger achievement check
      await supabase.rpc('check_and_award_achievements', {
        target_user_id: user.id
      });
      
      // Refetch achievements to see if any new ones were awarded
      queryClient.invalidateQueries({ queryKey: ['user-achievement-progress', user?.id] });
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  // Listen for real-time achievement updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-achievements-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('New achievement earned!', payload);
          
          // Fetch the full achievement details
          const { data: achievement } = await supabase
            .from('achievements')
            .select('*')
            .eq('id', payload.new.achievement_id)
            .single();
          
          if (achievement) {
            // Show the toast notification
            showAchievementToast(achievement);
            setNewAchievements(prev => [...prev, achievement]);
          }
          
          // Refresh achievement list and member stats
          queryClient.invalidateQueries({ queryKey: ['user-achievement-progress', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['member-status', user?.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const dismissNotification = (achievementId: string) => {
    setNewAchievements(prev => prev.filter(a => a.id !== achievementId));
  };

  const getEarnedAchievements = () => {
    return sortAchievementsByRarity(achievements.filter(a => a.is_earned));
  };

  const getUnlockedAchievements = () => {
    return sortAchievementsByRarity(achievements.filter(a => !a.is_earned));
  };

  const getTotalPoints = () => {
    return getEarnedAchievements().reduce((sum, a) => sum + a.points, 0);
  };

  return {
    achievements,
    newAchievements,
    isLoading,
    checkForNewAchievements,
    dismissNotification,
    getEarnedAchievements,
    getUnlockedAchievements,
    getTotalPoints
  };
};
