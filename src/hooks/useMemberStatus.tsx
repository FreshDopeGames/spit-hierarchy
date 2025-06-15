
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAchievements } from '@/hooks/useAchievements';
import { showAchievementToast } from '@/components/achievements/AchievementToast';

export type MemberStatus = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

interface StatusThresholds {
  bronze: { min: 0; max: 99; multiplier: 1 };
  silver: { min: 100; max: 299; multiplier: 2 };
  gold: { min: 300; max: 599; multiplier: 3 };
  platinum: { min: 600; max: 999; multiplier: 4 };
  diamond: { min: 1000; max: Infinity; multiplier: 5 };
}

const STATUS_THRESHOLDS: StatusThresholds = {
  bronze: { min: 0, max: 99, multiplier: 1 },
  silver: { min: 100, max: 299, multiplier: 2 },
  gold: { min: 300, max: 599, multiplier: 3 },
  platinum: { min: 600, max: 999, multiplier: 4 },
  diamond: { min: 1000, max: Infinity, multiplier: 5 }
};

export const useMemberStatus = () => {
  const { user } = useAuth();
  const { getTotalPoints } = useAchievements();
  const [previousStatus, setPreviousStatus] = useState<MemberStatus | null>(null);

  const { data: memberStats, refetch } = useQuery({
    queryKey: ['member-status', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('member_stats')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const totalPoints = getTotalPoints();
  const currentStatus = memberStats?.status as MemberStatus || 'bronze';

  // Calculate progress to next level
  const getProgressToNextLevel = () => {
    const statusEntries = Object.entries(STATUS_THRESHOLDS) as [MemberStatus, typeof STATUS_THRESHOLDS.bronze][];
    const currentIndex = statusEntries.findIndex(([status]) => status === currentStatus);
    
    if (currentIndex === statusEntries.length - 1) {
      // Already at max level
      return { percentage: 100, pointsToNext: 0, nextLevel: null as MemberStatus | null };
    }

    const nextLevelData = statusEntries[currentIndex + 1];
    const currentLevelData = statusEntries[currentIndex];
    
    const pointsInCurrentLevel = totalPoints - currentLevelData[1].min;
    const pointsNeededForLevel = nextLevelData[1].min - currentLevelData[1].min;
    const percentage = Math.min((pointsInCurrentLevel / pointsNeededForLevel) * 100, 100);
    const pointsToNext = Math.max(nextLevelData[1].min - totalPoints, 0);

    return {
      percentage,
      pointsToNext,
      nextLevel: nextLevelData[0]
    };
  };

  const getVoteMultiplier = (status: MemberStatus = currentStatus) => {
    return STATUS_THRESHOLDS[status]?.multiplier || 1;
  };

  const getStatusColor = (status: MemberStatus) => {
    switch (status) {
      case 'diamond':
        return 'text-cyan-400';
      case 'platinum':
        return 'text-gray-300';
      case 'gold':
        return 'text-yellow-400';
      case 'silver':
        return 'text-gray-400';
      case 'bronze':
      default:
        return 'text-amber-600';
    }
  };

  // Check for level up
  useEffect(() => {
    if (previousStatus && currentStatus !== previousStatus) {
      // Show level up notification
      const statusOrder: MemberStatus[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
      const previousIndex = statusOrder.indexOf(previousStatus);
      const currentIndex = statusOrder.indexOf(currentStatus);
      
      if (currentIndex > previousIndex) {
        // Level up!
        showAchievementToast({
          id: `level-up-${currentStatus}`,
          name: `Level Up! ${currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)} Member`,
          description: `You've reached ${currentStatus} status! Your votes now count ${getVoteMultiplier()}x.`,
          icon: 'Crown',
          rarity: 'legendary' as const,
          points: 0
        });
      }
    }
    setPreviousStatus(currentStatus);
  }, [currentStatus, previousStatus, getVoteMultiplier]);

  return {
    memberStats,
    currentStatus,
    totalPoints,
    getProgressToNextLevel,
    getVoteMultiplier,
    getStatusColor,
    refetch
  };
};
