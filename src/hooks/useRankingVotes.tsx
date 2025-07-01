
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useMemberStatus } from "@/hooks/useMemberStatus";
import { toast } from "sonner";
import { VoteSubmissionParams } from "./ranking-votes/types";
import { submitVote } from "./ranking-votes/voteSubmission";
import { applyOptimisticUpdate, clearPendingStates, invalidateRelatedQueries } from "./ranking-votes/optimisticUpdates";

export const useRankingVotes = () => {
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

  const submitRankingVote = useMutation({
    mutationFn: async ({ rankingId, rapperId }: VoteSubmissionParams) => {
      if (!user) throw new Error('User not authenticated');
      
      const voteWeight = getVoteMultiplier();
      return await submitVote(rankingId, rapperId, user, voteWeight, currentStatus);
    },
    onMutate: async ({ rankingId, rapperId }) => {
      const voteWeight = getVoteMultiplier();
      
      console.log(`Starting vote submission for rapper ${rapperId} in ranking ${rankingId}`);
      
      // Show loading toast
      toast.loading("Submitting your vote...", {
        id: 'vote-submission'
      });
      
      // Apply optimistic update
      applyOptimisticUpdate(queryClient, rankingId, rapperId, voteWeight);
      
      return { voteWeight, rankingId, rapperId };
    },
    onSuccess: (data, variables) => {
      console.log(`Vote submission successful for rapper ${variables.rapperId} in ranking ${variables.rankingId}`);
      
      // Update loading toast to success
      toast.success("Vote submitted successfully!", {
        id: 'vote-submission'
      });
      
      // Clear pending states and invalidate ONLY relevant queries
      if (user) {
        clearPendingStates(queryClient, data.ranking_id);
        invalidateRelatedQueries(queryClient, user.id, data.ranking_id);
      }
    },
    onError: (error, variables) => {
      console.error(`Vote submission failed for rapper ${variables.rapperId} in ranking ${variables.rankingId}:`, error);
      
      // Update loading toast to error
      toast.error(error instanceof Error ? error.message : "Failed to submit vote", {
        id: 'vote-submission'
      });
      
      // FIXED: Only revert optimistic updates for the SPECIFIC ranking that failed
      if (user && variables.rankingId) {
        console.log(`Reverting optimistic updates for ranking ${variables.rankingId}`);
        queryClient.invalidateQueries({ 
          queryKey: ['ranking-data-with-deltas', variables.rankingId],
          exact: true 
        });
        
        // Also invalidate the specific daily votes cache
        const today = new Date().toISOString().split('T')[0];
        queryClient.invalidateQueries({ 
          queryKey: ['daily-votes', user.id, today, variables.rankingId],
          exact: true
        });
      }
    }
  });

  return {
    submitRankingVote,
    getVoteMultiplier,
    currentStatus
  };
};
