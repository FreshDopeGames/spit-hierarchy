import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMemberStatus } from '@/hooks/useMemberStatus';
import { useToast } from '@/hooks/use-toast';
import { RankingItemWithDelta } from './useRankingData';
import { useDailyVoteStatus } from '@/hooks/useDailyVoteStatus';

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

      // Insert the ranking vote
      const { data: voteData, error: voteError } = await supabase
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

      if (voteError) throw voteError;

      // Also insert into daily vote tracking
      const { error: dailyError } = await supabase
        .from('daily_vote_tracking')
        .upsert({
          user_id: user.id,
          ranking_id: rankingId,
          rapper_id: rapperId,
          vote_date: new Date().toISOString().split('T')[0]
        }, {
          onConflict: 'user_id,rapper_id,ranking_id,vote_date'
        });

      if (dailyError) throw dailyError;

      return voteData;
    },
    onMutate: async ({ rankingId, rapperId }) => {
      // Get daily vote status to check if user has already voted
      const today = new Date().toISOString().split('T')[0];
      const dailyVotesKey = ['daily-votes', user?.id, today, rankingId];
      const dailyVotes = queryClient.getQueryData<any[]>(dailyVotesKey) || [];
      
      // Check if user has already voted for this rapper today
      const hasAlreadyVoted = dailyVotes.some(vote => 
        vote.rapper_id === rapperId && 
        vote.ranking_id === rankingId &&
        vote.vote_date === today
      );

      // If user has already voted, don't apply optimistic update
      if (hasAlreadyVoted) {
        console.log('User has already voted for this rapper today, skipping optimistic update');
        return { previousData: null, alreadyVoted: true };
      }

      const voteWeight = getVoteMultiplier();
      
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['ranking-data-with-deltas', rankingId] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<RankingItemWithDelta[]>(['ranking-data-with-deltas', rankingId]);

      // Only apply optimistic update if this is a new vote
      queryClient.setQueryData<RankingItemWithDelta[]>(
        ['ranking-data-with-deltas', rankingId],
        (oldData) => {
          if (!oldData) return oldData;
          
          return oldData.map(item => {
            if (item.rapper?.id === rapperId) {
              return {
                ...item,
                ranking_votes: item.ranking_votes + voteWeight
              };
            }
            return item;
          });
        }
      );

      return { previousData, alreadyVoted: false };
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update on error (only if we applied one)
      if (context?.previousData && !context?.alreadyVoted) {
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
    onSuccess: (_, variables, context) => {
      const voteWeight = getVoteMultiplier();
      
      // Show different messages based on whether this was a new vote or update
      if (context?.alreadyVoted) {
        toast({
          title: "Vote counted!",
          description: `Your ${currentStatus} status vote has been counted!`,
        });
      } else {
        toast({
          title: "Vote submitted!",
          description: `Your ${currentStatus} status vote counts as ${voteWeight} ${voteWeight === 1 ? 'vote' : 'votes'}!`,
        });
      }

      // Invalidate member stats and achievements to check for updates
      queryClient.invalidateQueries({ queryKey: ['member-status', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-achievement-progress', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['all-achievements'] });

      // Invalidate recent ranking votes to show the new vote
      queryClient.invalidateQueries({ queryKey: ['user-recent-ranking-votes', user?.id] });

      // Invalidate daily votes cache to ensure fresh data
      const today = new Date().toISOString().split('T')[0];
      queryClient.invalidateQueries({ queryKey: ['daily-votes', user?.id, today, variables.rankingId] });

      // Invalidate homepage data to sync vote counts immediately
      queryClient.invalidateQueries({ queryKey: ['top-active-rankings-for-sections'] });
      queryClient.invalidateQueries({ queryKey: ['ranking-vote-counts', variables.rankingId] });

      // The real-time subscription will handle the actual data update
      // No need to manually invalidate queries here for ranking data
    }
  });

  return {
    submitRankingVote,
    getVoteMultiplier,
    currentStatus
  };
};
