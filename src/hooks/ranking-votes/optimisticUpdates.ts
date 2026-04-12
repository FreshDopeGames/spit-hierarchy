
import { QueryClient } from "@tanstack/react-query";
import { RankingItemWithDelta, sortItemsByVotes, calculateVisualRanks } from '@/hooks/useRankingData';

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
      
      // Find the item being voted on and its current position
      const currentIndex = oldData.findIndex(item => item.rapper?.id === rapperId);
      
      // 1. Update vote count and mark as pending
      const updatedData = oldData.map(item => {
        if (item.rapper?.id === rapperId) {
          const newVoteCount = item.ranking_votes + voteWeight;
          console.log(`Optimistic update: ${item.rapper?.name} votes ${item.ranking_votes} -> ${newVoteCount}`);
          
          return {
            ...item,
            ranking_votes: newVoteCount,
            isPending: true,
            justMoved: false // Will be set to true after sorting if position changed
          };
        }
        return { ...item, justMoved: false };
      });
      
      // 2. Re-sort by votes so item moves immediately
      const sorted = sortItemsByVotes(updatedData);
      const withRanks = calculateVisualRanks(sorted);
      
      // 3. Find new position and mark justMoved if position improved
      const newIndex = sorted.findIndex(item => item.rapper?.id === rapperId);
      const positionImproved = currentIndex > newIndex;
      
      // 4. Recalculate display_index and set justMoved flag
      return withRanks.map((item, index) => ({
        ...item,
        display_index: index + 1,
        justMoved: item.rapper?.id === rapperId && positionImproved
      }));
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

export const clearJustMovedStates = (
  queryClient: QueryClient,
  rankingId: string
) => {
  setTimeout(() => {
    queryClient.setQueryData<RankingItemWithDelta[]>(
      ['ranking-data-with-deltas', rankingId],
      (oldData: RankingItemWithDelta[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(item => ({ ...item, justMoved: false }));
      }
    );
  }, 700); // Clear after animation completes
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
  
  // Delay the ranking data refetch to ensure DB transaction is fully committed
  // This prevents stale reads that would overwrite the optimistic update
  setTimeout(() => {
    queryClient.invalidateQueries({ 
      queryKey: ['ranking-data-with-deltas', rankingId],
      exact: true
    });
    queryClient.refetchQueries({ 
      queryKey: ['ranking-data-with-deltas', rankingId],
      exact: true
    });
  }, 500);

  // Safety net: second refetch to catch any delayed DB propagation
  setTimeout(() => {
    queryClient.invalidateQueries({ 
      queryKey: ['ranking-data-with-deltas', rankingId],
      exact: true
    });
  }, 1500);
};
