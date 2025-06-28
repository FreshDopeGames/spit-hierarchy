
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
  const { data: memberData } = useMemberStatus(user?.id);
  
  const currentStatus = memberData?.status || 'bronze';

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
      
      // Show loading toast
      toast.loading("Submitting your vote...", {
        id: 'vote-submission'
      });
      
      // Apply optimistic update
      applyOptimisticUpdate(queryClient, rankingId, rapperId, voteWeight);
      
      return { voteWeight };
    },
    onSuccess: (data) => {
      // Update loading toast to success
      toast.success("Vote submitted successfully!", {
        id: 'vote-submission'
      });
      
      // Clear pending states
      if (user) {
        clearPendingStates(queryClient, data.ranking_id);
        invalidateRelatedQueries(queryClient, user.id, data.ranking_id);
      }
    },
    onError: (error) => {
      console.error('Vote submission failed:', error);
      
      // Update loading toast to error
      toast.error(error instanceof Error ? error.message : "Failed to submit vote", {
        id: 'vote-submission'
      });
      
      // Revert optimistic updates by invalidating queries
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['ranking-data-with-deltas'] });
      }
    }
  });

  return {
    submitRankingVote,
    getVoteMultiplier,
    currentStatus
  };
};
