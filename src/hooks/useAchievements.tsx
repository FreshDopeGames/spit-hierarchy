
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useAchievements = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newAchievements, setNewAchievements] = useState<any[]>([]);

  // Fetch ALL achievements
  const { data: allAchievements, isLoading: loadingAll } = useQuery({
    queryKey: ['all-achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('points', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch user progress for achievements
  const { data: userProgress, isLoading: loadingProgress } = useQuery({
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
    enabled: !!user
  });

  // Combine all achievements with user progress
  const achievements = allAchievements?.map(achievement => {
    const progress = userProgress?.find(p => p.achievement_id === achievement.id);
    return {
      ...achievement,
      progress_value: progress?.progress_value || 0,
      progress_percentage: progress?.progress_percentage || 0,
      is_earned: progress?.is_earned || false,
      earned_at: progress?.earned_at || null
    };
  }) || [];

  const isLoading = loadingAll || loadingProgress;

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
            setNewAchievements(prev => [...prev, achievement]);
          }
          
          // Refresh achievement list
          queryClient.invalidateQueries({ queryKey: ['user-achievement-progress', user?.id] });
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
    return achievements.filter(a => a.is_earned);
  };

  const getUnlockedAchievements = () => {
    return achievements.filter(a => !a.is_earned);
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
