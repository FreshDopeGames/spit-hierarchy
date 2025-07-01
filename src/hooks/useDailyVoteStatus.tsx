
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { DailyVoteRecord } from './daily-votes/types';
import { getTodayKey, getStoredVotes, storeVotes, cleanupOldStorage } from './daily-votes/storage';
import { fetchDailyVotes } from './daily-votes/queries';
import { hasVotedForRapper, createVoteRecord, voteExists } from './daily-votes/validation';

export const useDailyVoteStatus = (rankingId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch today's votes from database - check both tables for today's votes
  const { data: dailyVotes = [], isLoading } = useQuery({
    queryKey: ['daily-votes', user?.id, getTodayKey(), rankingId],
    queryFn: async () => {
      if (!user || !rankingId) return [];
      return fetchDailyVotes(user.id, rankingId);
    },
    enabled: !!user && !!rankingId,
    staleTime: 2 * 60 * 1000, // 2 minutes - shorter for daily voting
    initialData: rankingId && user ? getStoredVotes(rankingId, user.id) : [],
  });

  // ENHANCED: Check if user has voted for a specific rapper TODAY in THIS ranking
  const hasVotedToday = (rapperId: string): boolean => {
    if (!user || !rankingId) return false;
    return hasVotedForRapper(dailyVotes, rapperId, rankingId, user.id);
  };

  // ENHANCED: Add a vote to today's tracking for a SPECIFIC rapper in THIS ranking
  const addVoteToTracking = (rapperId: string) => {
    if (!user || !rankingId) return;

    const today = getTodayKey();
    console.log(`Adding vote tracking for rapper ${rapperId} in ranking ${rankingId}`);
    
    const newVote = createVoteRecord(user.id, rapperId, rankingId);

    // Update query cache optimistically - ONLY for this specific query
    queryClient.setQueryData<DailyVoteRecord[]>(
      ['daily-votes', user.id, today, rankingId],
      (oldData = []) => {
        // Only add if not already present for this rapper in this ranking
        if (voteExists(oldData, rapperId, rankingId, user.id)) {
          console.log(`Vote already tracked for rapper ${rapperId} in ranking ${rankingId}`);
          return oldData;
        }
        
        console.log(`Adding new vote to cache for rapper ${rapperId} in ranking ${rankingId}`);
        return [...oldData, newVote];
      }
    );

    // Update localStorage with the new vote - ranking-specific
    const currentStored = getStoredVotes(rankingId, user.id);
    if (!voteExists(currentStored, rapperId, rankingId, user.id)) {
      const updatedVotes = [...currentStored, newVote];
      storeVotes(rankingId, updatedVotes, user.id);
      console.log(`Updated localStorage for ranking ${rankingId} with new vote`);
    }
  };

  // Clean up old localStorage data on mount and migrate from old global format
  useEffect(() => {
    if (rankingId && user?.id) {
      cleanupOldStorage(rankingId, user.id);
    }
  }, [rankingId, user?.id]);

  return {
    hasVotedToday,
    addVoteToTracking,
    isLoading
  };
};
