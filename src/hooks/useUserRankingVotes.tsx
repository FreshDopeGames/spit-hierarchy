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
        throw new Error('Failed to submit vote. Please try again.');
      }

      // Track daily vote (we need to provide ranking_id as empty string or handle constraint)
      const { error: dailyError } = await supabase
        .from('daily_vote_tracking')
        .insert({
          user_id: user.id,
          ranking_id: '', // Dummy value to satisfy type requirement
          user_ranking_id: userRankingId,
          rapper_id: rapperId,
          vote_date: new Date().toISOString().split('T')[0]
        } as any); // Cast to bypass TypeScript check since we have unique constraints

      if (dailyError) {
        console.error('Daily tracking error:', dailyError);
      }

      return voteData;
    },
    onMutate: async ({ userRankingId, rapperId }) => {
      toast.loading("Submitting your vote...", {
        id: 'user-ranking-vote-submission'
      });
      
      return { userRankingId, rapperId };
    },
    onSuccess: (data, variables) => {
      toast.success("Vote submitted successfully!", {
        id: 'user-ranking-vote-submission'
      });
      
      // Invalidate relevant queries
      if (user) {
        queryClient.invalidateQueries({ 
          queryKey: ['user-ranking-detail', variables.userRankingId]
        });
        queryClient.invalidateQueries({ 
          queryKey: ['user-rankings']
        });
      }
    },
    onError: (error, variables) => {
      console.error('User ranking vote failed:', error);
      
      toast.error(error instanceof Error ? error.message : "Failed to submit vote", {
        id: 'user-ranking-vote-submission'
      });
    }
  });

  return {
    submitUserRankingVote,
    getVoteMultiplier,
    currentStatus
  };
};
