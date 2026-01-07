
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAchievements } from '@/hooks/useAchievements';
import { toast } from 'sonner';
import { 
  markLevelUpNotificationShown, 
  hasLevelUpNotificationBeenShown 
} from '@/utils/notificationTracking';

export type MemberStatus = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

interface StatusThresholds {
  bronze: { min: number; max: number; multiplier: number };
  silver: { min: number; max: number; multiplier: number };
  gold: { min: number; max: number; multiplier: number };
  platinum: { min: number; max: number; multiplier: number };
  diamond: { min: number; max: number; multiplier: number };
}

const STATUS_THRESHOLDS: StatusThresholds = {
  bronze: { min: 0, max: 499, multiplier: 1 },
  silver: { min: 500, max: 1499, multiplier: 2 },
  gold: { min: 1500, max: 3499, multiplier: 3 },
  platinum: { min: 3500, max: 6999, multiplier: 4 },
  diamond: { min: 7000, max: Infinity, multiplier: 5 }
};

export const useMemberStatus = () => {
  const { user } = useAuth();
  const { getTotalPoints } = useAchievements();
  const [previousStatus, setPreviousStatus] = useState<MemberStatus | null>(null);
  const [hasShownInitialStatus, setHasShownInitialStatus] = useState(false);

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

  // Check for level up with persistent tracking
  useEffect(() => {
    if (!user || !hasShownInitialStatus) {
      // Set initial status without showing notification
      if (currentStatus && !hasShownInitialStatus) {
        setPreviousStatus(currentStatus);
        setHasShownInitialStatus(true);
      }
      return;
    }

    if (previousStatus && currentStatus !== previousStatus) {
      // Check if this is actually a level up
      const statusOrder: MemberStatus[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
      const previousIndex = statusOrder.indexOf(previousStatus);
      const currentIndex = statusOrder.indexOf(currentStatus);
      
      if (currentIndex > previousIndex) {
        // This is a level up - check if we've already shown this notification
        const notificationKey = `${user.id}-${currentStatus}`;
        
        if (!hasLevelUpNotificationBeenShown(user.id, currentStatus)) {
          const multiplier = getVoteMultiplier();
          const statusCapitalized = currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1);
          
          // Show level up notification using Sonner
          toast.success(`🎉 Level Up! ${statusCapitalized} Member`, {
            description: `You've reached ${currentStatus} status! Your votes now count ${multiplier}x.`,
            duration: 5000,
          });
          
          // Mark this notification as shown
          markLevelUpNotificationShown(user.id, currentStatus);
          
          // Create persistent notification in database
          supabase.rpc('create_notification', {
            p_user_id: user.id,
            p_type: 'level_up',
            p_title: `Level Up! ${statusCapitalized} Member`,
            p_message: `You've reached ${currentStatus} status! Your votes now count ${multiplier}x.`,
            p_metadata: { 
              old_status: previousStatus, 
              new_status: currentStatus,
              multiplier: multiplier
            },
            p_link_url: '/profile',
            p_priority: 8
          });
        }
      }
    }
    
    setPreviousStatus(currentStatus);
  }, [currentStatus, previousStatus, user, getVoteMultiplier, hasShownInitialStatus]);

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
