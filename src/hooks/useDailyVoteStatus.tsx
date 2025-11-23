
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { DailyVoteRecord } from './daily-votes/types';
import { getTodayKey, getStoredVotes, storeVotes, cleanupOldStorage } from './daily-votes/storage';
import { fetchDailyVotes } from './daily-votes/queries';
import { hasVotedForRapper, createVoteRecord, voteExists } from './daily-votes/validation';

// Strict UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const useDailyVoteStatus = (rankingId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Validate rankingId is a proper UUID before making any queries
  const isValidRankingId = rankingId && UUID_REGEX.test(rankingId);

  // Fetch today's votes from database - check both ranking_votes and user_ranking_votes tables
  const { data: dailyVotes = [], isLoading } = useQuery({
    queryKey: ['daily-votes', user?.id, getTodayKey(), rankingId],
    queryFn: async () => {
      if (!user || !rankingId) return [];
      return fetchDailyVotes(user.id, rankingId);
    },
    enabled: !!user && !!isValidRankingId,
    staleTime: 2 * 60 * 1000, // 2 minutes - shorter for daily voting
    initialData: isValidRankingId && user ? getStoredVotes(rankingId, user.id) : [],
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
    const newVote = createVoteRecord(user.id, rapperId, rankingId);

    // Update query cache optimistically - ONLY for this specific query
    queryClient.setQueryData<DailyVoteRecord[]>(
      ['daily-votes', user.id, today, rankingId],
      (oldData = []) => {
        // Only add if not already present for this rapper in this ranking
        if (voteExists(oldData, rapperId, rankingId, user.id)) return oldData;
        return [...oldData, newVote];
      }
    );

    // Update localStorage with the new vote - ranking-specific
    const currentStored = getStoredVotes(rankingId, user.id);
    if (!voteExists(currentStored, rapperId, rankingId, user.id)) {
      const updatedVotes = [...currentStored, newVote];
      storeVotes(rankingId, updatedVotes, user.id);
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
