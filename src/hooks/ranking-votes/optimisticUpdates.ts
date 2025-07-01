
import { QueryClient } from "@tanstack/react-query";
import { RankingItemWithDelta } from '@/hooks/useRankingData';

export const applyOptimisticUpdate = (
  queryClient: QueryClient,
  rankingId: string,
  rapperId: string,
  voteWeight: number
) => {
  queryClient.setQueryData<RankingItemWithDelta[]>(
    ['ranking-data-with-deltas', rankingId],
    (oldData: RankingItemWithDelta[] | undefined) => {
      if (!oldData) return oldData;
      
      return oldData.map(item => {
        if (item.rapper?.id === rapperId) {
          const newVoteCount = item.ranking_votes + voteWeight;
          console.log(`Optimistic update: ${item.rapper?.name} votes ${item.ranking_votes} -> ${newVoteCount}`);
          
          return {
            ...item,
            ranking_votes: newVoteCount,
            isPending: true // Add pending state
          };
        }
        return item;
      });
    }
  );
};

export const clearPendingStates = (
  queryClient: QueryClient,
  rankingId: string
) => {
  queryClient.setQueryData<RankingItemWithDelta[]>(
    ['ranking-data-with-deltas', rankingId],
    (oldData: RankingItemWithDelta[] | undefined) => {
      if (!oldData) return oldData;
      return oldData.map(item => ({
        ...item,
        isPending: false
      }));
    }
  );
};

export const invalidateRelatedQueries = (
  queryClient: QueryClient,
  userId: string,
  rankingId: string
) => {
  // FIXED: Make cache invalidation more specific to prevent cross-ranking contamination
  console.log(`Invalidating queries for ranking ${rankingId} and user ${userId}`);
  
  // Only invalidate member status and achievement queries (these are user-global)
  queryClient.invalidateQueries({ queryKey: ['member-status', userId] });
  queryClient.invalidateQueries({ queryKey: ['user-achievement-progress', userId] });
  queryClient.invalidateQueries({ queryKey: ['user-recent-ranking-votes', userId] });
  queryClient.invalidateQueries({ queryKey: ['top-active-rankings-for-sections'] });
  
  // CRITICAL FIX: Only invalidate daily votes for THIS SPECIFIC ranking
  const today = new Date().toISOString().split('T')[0];
  queryClient.invalidateQueries({ 
    queryKey: ['daily-votes', userId, today, rankingId],
    exact: true // Only invalidate exact match, not partial matches
  });
  
  // Only invalidate ranking data for THIS specific ranking
  queryClient.invalidateQueries({ 
    queryKey: ['ranking-data-with-deltas', rankingId],
    exact: true
  });
};
