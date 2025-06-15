
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface DailyVoteRecord {
  user_id: string;
  rapper_id: string;
  ranking_id: string;
  vote_date: string;
}

const STORAGE_KEY = 'daily_votes';

export const useDailyVoteStatus = (rankingId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get today's date in YYYY-MM-DD format
  const getTodayKey = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Get stored votes from localStorage
  const getStoredVotes = (): DailyVoteRecord[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const data = JSON.parse(stored);
      const today = getTodayKey();
      
      // Clear old data if it's from a different day
      if (data.date !== today) {
        localStorage.removeItem(STORAGE_KEY);
        return [];
      }
      
      return data.votes || [];
    } catch {
      return [];
    }
  };

  // Store votes in localStorage
  const storeVotes = (votes: DailyVoteRecord[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        date: getTodayKey(),
        votes
      }));
    } catch (error) {
      console.error('Failed to store votes in localStorage:', error);
    }
  };

  // Fetch today's votes from database
  const { data: dailyVotes = [], isLoading } = useQuery({
    queryKey: ['daily-votes', user?.id, getTodayKey(), rankingId],
    queryFn: async () => {
      if (!user || !rankingId) return [];

      const { data, error } = await supabase
        .from('daily_vote_tracking')
        .select('user_id, rapper_id, ranking_id, vote_date')
        .eq('user_id', user.id)
        .eq('ranking_id', rankingId)
        .eq('vote_date', getTodayKey());

      if (error) throw error;
      
      // Store in localStorage for caching
      storeVotes(data);
      
      return data;
    },
    enabled: !!user && !!rankingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: getStoredVotes,
  });

  // Check if user has voted for a specific rapper today
  const hasVotedToday = (rapperId: string): boolean => {
    if (!user || !rankingId) return false;
    
    return dailyVotes.some(vote => 
      vote.rapper_id === rapperId && 
      vote.ranking_id === rankingId &&
      vote.vote_date === getTodayKey()
    );
  };

  // Add a vote to today's tracking (for optimistic updates)
  const addVoteToTracking = (rapperId: string) => {
    if (!user || !rankingId) return;

    const newVote: DailyVoteRecord = {
      user_id: user.id,
      rapper_id: rapperId,
      ranking_id: rankingId,
      vote_date: getTodayKey()
    };

    // Update query cache optimistically
    queryClient.setQueryData<DailyVoteRecord[]>(
      ['daily-votes', user.id, getTodayKey(), rankingId],
      (oldData = []) => [...oldData, newVote]
    );

    // Update localStorage
    const updatedVotes = [...dailyVotes, newVote];
    storeVotes(updatedVotes);
  };

  // Clean up old localStorage data on mount
  useEffect(() => {
    const today = getTodayKey();
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.date !== today) {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  return {
    hasVotedToday,
    addVoteToTracking,
    isLoading
  };
};
