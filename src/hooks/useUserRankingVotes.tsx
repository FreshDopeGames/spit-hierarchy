import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useMemberStatus } from "@/hooks/useMemberStatus";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UserRankingVoteParams {
  userRankingId: string;
  rapperId: string;
}

export const useUserRankingVotes = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { currentStatus } = useMemberStatus();

  const getVoteMultiplier = () => {
    switch (currentStatus) {
      case 'diamond': return 5;
      case 'platinum': return 4;
      case 'gold': return 3;
      case 'silver': return 2;
      case 'bronze': return 1;
      default: return 1;
    }
  };

  const submitUserRankingVote = useMutation({
    mutationFn: async ({ userRankingId, rapperId }: UserRankingVoteParams) => {
      if (!user) throw new Error('User not authenticated');
      
      const voteWeight = getVoteMultiplier();
      
      // Validate inputs
      if (!userRankingId.match(/^[a-f0-9-]{36}$/i) || !rapperId.match(/^[a-f0-9-]{36}$/i)) {
        throw new Error('Invalid voting parameters');
      }

      // Check rate limit
      const { data: rateLimitOk } = await supabase.rpc('check_rate_limit', {
        action_type: 'user_ranking_vote',
        user_uuid: user.id
      });

      if (!rateLimitOk) {
        throw new Error('Rate limit exceeded. Please slow down.');
      }

      // Insert vote
      const { data: voteData, error: voteError } = await supabase
        .from('user_ranking_votes')
        .insert({
          user_id: user.id,
          user_ranking_id: userRankingId,
          rapper_id: rapperId,
          vote_weight: voteWeight,
          member_status: currentStatus,
          vote_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (voteError) {
        console.error('User ranking vote error:', voteError);
        const isDuplicate = (voteError as any)?.code === '23505' || String((voteError as any)?.message || '').includes('unique_user_ranking_daily_vote');
        if (isDuplicate) {
          throw new Error('You already voted for this rapper today.');
        }
        throw new Error('Failed to submit vote. Please try again.');
      }

      // Daily vote tracking is now handled automatically by database trigger
      return voteData;
    },
  onMutate: async ({ userRankingId, rapperId }) => {
      toast.loading("Submitting your vote...", {
        id: 'user-ranking-vote-submission'
      });
      
      // Optimistically update the daily vote tracking cache
      const today = new Date().toISOString().split('T')[0];
      const queryKey = ['daily-votes', user!.id, today, userRankingId];
      
      // Get the previous data for potential rollback
      const previousData = queryClient.getQueryData(queryKey);
      
      // Optimistically add this vote to the cache
      queryClient.setQueryData(queryKey, (old: any[] = []) => {
        // Check if vote already exists
        const voteExists = old.some((vote: any) => 
          vote.rapper_id === rapperId && 
          vote.user_ranking_id === userRankingId
        );
        
        if (voteExists) return old;
        
        return [
          ...old,
          {
            user_id: user!.id,
            rapper_id: rapperId,
            user_ranking_id: userRankingId,
            ranking_id: null,
            vote_date: today
          }
        ];
      });
      
      return { userRankingId, rapperId, previousData, queryKey };
    },
    onSuccess: (data, variables) => {
      toast.success("Vote submitted successfully!", {
        id: 'user-ranking-vote-submission'
      });
      
      // Invalidate relevant queries
      if (user) {
        const today = new Date().toISOString().split('T')[0];
        queryClient.invalidateQueries({ 
          queryKey: ['user-ranking-detail', variables.userRankingId]
        });
        queryClient.invalidateQueries({ 
          queryKey: ['user-rankings']
        });
        queryClient.invalidateQueries({
          queryKey: ['daily-votes', user.id, today, variables.userRankingId]
        });
      }
    },
    onError: (error, variables, context) => {
      console.error('User ranking vote failed:', error);
      
      toast.error(error instanceof Error ? error.message : "Failed to submit vote", {
        id: 'user-ranking-vote-submission'
      });
      
      // Rollback optimistic update on error
      if (context?.previousData && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }

      // Ensure caches reflect server truth
      if (user && variables) {
        const today = new Date().toISOString().split('T')[0];
        queryClient.invalidateQueries({ 
          queryKey: ['daily-votes', user.id, today, variables.userRankingId]
        });
        queryClient.invalidateQueries({ 
          queryKey: ['user-ranking-detail', variables.userRankingId]
        });
      }
    }
  });

  return {
    submitUserRankingVote,
    getVoteMultiplier,
    currentStatus
  };
};
