import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useMemberStatus } from "@/hooks/useMemberStatus";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UserRankingVoteParams {
  userRankingId: string;
  rapperId: string;
}

// Map error to user-friendly message
const mapErrorToMessage = (error: any): string => {
  const code = error?.code;
  const details = error?.details || '';
  const message = typeof error?.message === 'string' ? error.message : '';

  // Database constraint violations
  if (code === '23505' || details.includes('unique_user_ranking_daily_vote')) {
    return 'You have already voted for this rapper today. Come back tomorrow!';
  }
  
  // Invalid UUID syntax
  if (code === '22P02' || message.includes('invalid input syntax for type uuid')) {
    return 'Invalid voting parameters. Please refresh and try again.';
  }
  
  // Authentication errors
  if (code === '42501' || message.includes('UNAUTHENTICATED')) {
    return 'Please log in to vote.';
  }
  
  // Application-level errors from RPC
  if (message.includes('ALREADY_VOTED_TODAY')) {
    return 'You have already voted for this rapper today. Come back tomorrow!';
  }
  if (message.includes('INVALID_PARAMS')) {
    return 'Invalid voting parameters. Please refresh and try again.';
  }
  if (message.includes('RAPPER_NOT_FOUND')) {
    return 'Rapper not found. Please refresh and try again.';
  }
  if (message.includes('RANKING_NOT_FOUND')) {
    return 'Ranking not found. Please refresh and try again.';
  }
  
  // Network/connection errors
  if (message.toLowerCase().includes('fetch') || message.toLowerCase().includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  // Log unexpected errors for diagnostics
  console.warn('Vote failed', { path: 'community', code, details: details?.slice?.(0, 200) });
  
  return 'Failed to submit vote. Please try again.';
};

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
      
      // Validate inputs
      if (!userRankingId.match(/^[a-f0-9-]{36}$/i) || !rapperId.match(/^[a-f0-9-]{36}$/i)) {
        throw new Error('Invalid voting parameters. Please refresh and try again.');
      }

      // Ensure currentStatus is valid
      const memberStatus = ['bronze', 'silver', 'gold', 'platinum', 'diamond'].includes(currentStatus) 
        ? currentStatus 
        : 'bronze';

      // Call RPC function for atomic voting
      console.log('🎯 Submitting user ranking vote via RPC', { userRankingId, rapperId, memberStatus });
      const { data, error } = await supabase.rpc('vote_user_ranking' as any, {
        p_user_ranking_id: userRankingId,
        p_rapper_id: rapperId,
        p_member_status: memberStatus
      });

      if (error) {
        console.error('User ranking vote error:', error);
        console.warn('Vote failed', { 
          path: 'community', 
          code: error.code, 
          details: error.details?.slice?.(0, 200),
          message: error.message?.slice?.(0, 200)
        });
        const errorMessage = mapErrorToMessage(error);
        throw new Error(errorMessage);
      }

      // Handle JSON success payload from RPC
      if (data && typeof data === 'object') {
        if (data.success === false) {
          // RPC returned a controlled error
          console.warn('User ranking vote RPC returned failure:', data);
          if (data.reason === 'ALREADY_VOTED_TODAY') {
            throw new Error('You already voted for this rapper today. Try another one!');
          }
          throw new Error(data.message || 'Failed to submit vote');
        }
      }

      console.log('✅ User ranking vote successful:', data);
      return { user_ranking_id: data?.user_ranking_id || userRankingId, rapper_id: rapperId };
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
          queryKey: ['daily-votes', user.id, today, variables.userRankingId]
        });
        queryClient.invalidateQueries({ 
          queryKey: ['user-ranking-votes', variables.userRankingId]
        });
        queryClient.invalidateQueries({ 
          queryKey: ['user-ranking', variables.userRankingId]
        });
      }
    },
    onError: (error: any, variables, context) => {
      console.error('User ranking vote submission failed:', error);
      
      toast.error(error.message || 'Failed to submit vote', {
        id: 'user-ranking-vote-submission'
      });
      
      // Rollback optimistic update
      if (context?.queryKey && context?.previousData !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
    }
  });

  return {
    submitUserRankingVote,
    getVoteMultiplier,
    currentStatus
  };
};
