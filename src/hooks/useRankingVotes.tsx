
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

  // Log authentication state on mount and when it changes
  console.log('🔐 [useRankingVotes] Auth state:', {
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    currentStatus,
    timestamp: new Date().toISOString()
  });

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
      console.log('🎯 [useRankingVotes] Mutation function called', {
        rankingId,
        rapperId,
        hasUser: !!user,
        userId: user?.id
      });

      if (!user) {
        console.error('❌ [useRankingVotes] No user authenticated');
        throw new Error('User not authenticated');
      }
      
      const voteWeight = getVoteMultiplier();
      console.log('✓ [useRankingVotes] Calling submitVote with weight:', voteWeight);
      
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
        const result = data as { ranking_id: string };
        clearPendingStates(queryClient, result.ranking_id);
        invalidateRelatedQueries(queryClient, user.id, result.ranking_id);
      }
    },
    onError: (error, variables) => {
      console.error('❌ [useRankingVotes] Vote submission failed:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorCode: (error as any)?.code,
        errorDetails: (error as any)?.details,
        rapperId: variables.rapperId,
        rankingId: variables.rankingId,
        userId: user?.id
      });
      
      // Map error codes to user-friendly messages
      let errorMessage = "Failed to submit vote. Please try again.";
      let errorDescription: string | undefined;
      
      if (error instanceof Error) {
        const msg = error.message;
        
        // Check for specific error codes
        if (msg.includes('ALREADY_VOTED_TODAY')) {
          errorMessage = "You've already voted for this rapper today";
          errorDescription = "Come back tomorrow to vote again!";
        } else if (msg.includes('UNAUTHENTICATED')) {
          errorMessage = "Please sign in to vote";
        } else if (msg.includes('INVALID_PARAMS')) {
          errorMessage = "Invalid voting parameters";
          errorDescription = "Please refresh the page and try again";
        } else if (msg.includes('RAPPER_NOT_FOUND')) {
          errorMessage = "Rapper not found";
          errorDescription = "This rapper may have been removed";
        } else if (msg.includes('RANKING_NOT_FOUND')) {
          errorMessage = "Ranking not found";
          errorDescription = "This ranking may no longer exist";
        } else if (msg.includes('network') || msg.includes('fetch')) {
          errorMessage = "Network error";
          errorDescription = "Please check your connection and try again";
        } else {
          errorMessage = msg;
          errorDescription = (error as any)?.details;
        }
      }
      
      // Update loading toast to error with detailed message
      toast.error(errorMessage, {
        id: 'vote-submission',
        description: errorDescription
      });
      
      // FIXED: Only revert optimistic updates for the SPECIFIC ranking that failed
      if (user && variables.rankingId) {
        console.log(`🔄 [useRankingVotes] Reverting optimistic updates for ranking ${variables.rankingId}`);
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
