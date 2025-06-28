
import { RankingItemWithDelta } from '@/hooks/useRankingData';

export const applyOptimisticUpdate = (
  queryClient: any,
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
  queryClient: any,
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
  queryClient: any,
  userId: string,
  rankingId: string
) => {
  // Invalidate relevant queries for real-time updates
  queryClient.invalidateQueries({ queryKey: ['member-status', userId] });
  queryClient.invalidateQueries({ queryKey: ['user-achievement-progress', userId] });
  queryClient.invalidateQueries({ queryKey: ['user-recent-ranking-votes', userId] });
  queryClient.invalidateQueries({ queryKey: ['top-active-rankings-for-sections'] });
  
  // Invalidate daily votes cache
  const today = new Date().toISOString().split('T')[0];
  queryClient.invalidateQueries({ queryKey: ['daily-votes', userId, today, rankingId] });
};
