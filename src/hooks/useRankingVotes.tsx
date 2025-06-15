
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMemberStatus } from '@/hooks/useMemberStatus';
import { useToast } from '@/hooks/use-toast';
import { RankingItemWithDelta } from './useRankingData';

export const useRankingVotes = () => {
  const { user } = useAuth();
  const { currentStatus, getVoteMultiplier } = useMemberStatus();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitRankingVote = useMutation({
    mutationFn: async ({
      rankingId,
      rapperId
    }: {
      rankingId: string;
      rapperId: string;
    }) => {
      if (!user) throw new Error('User must be logged in to vote');

      const voteWeight = getVoteMultiplier();

      const { data, error } = await supabase
        .from('ranking_votes')
        .upsert({
          user_id: user.id,
          ranking_id: rankingId,
          rapper_id: rapperId,
          vote_weight: voteWeight,
          member_status: currentStatus,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,ranking_id,rapper_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ rankingId, rapperId }) => {
      // Optimistic update - immediately show the vote increase
      const voteWeight = getVoteMultiplier();
      
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['ranking-data-with-deltas', rankingId] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<RankingItemWithDelta[]>(['ranking-data-with-deltas', rankingId]);

      // Optimistically update the cache
      queryClient.setQueryData<RankingItemWithDelta[]>(
        ['ranking-data-with-deltas', rankingId],
        (oldData) => {
          if (!oldData) return oldData;
          
          return oldData.map(item => {
            if (item.rapper?.id === rapperId) {
              return {
                ...item,
                rapper: {
                  ...item.rapper,
                  total_votes: (item.rapper.total_votes || 0) + voteWeight
                }
              };
            }
            return item;
          });
        }
      );

      return { previousData };
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousData) {
        queryClient.setQueryData(
          ['ranking-data-with-deltas', variables.rankingId],
          context.previousData
        );
      }
      
      console.error('Error submitting ranking vote:', error);
      toast({
        title: "Error",
        description: "Failed to submit vote. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: (_, variables) => {
      const voteWeight = getVoteMultiplier();
      
      toast({
        title: "Vote submitted!",
        description: `Your ${currentStatus} status vote counts as ${voteWeight} ${voteWeight === 1 ? 'vote' : 'votes'}!`,
      });

      // The real-time subscription will handle the actual data update
      // No need to manually invalidate queries here
    }
  });

  return {
    submitRankingVote,
    getVoteMultiplier,
    currentStatus
  };
};
