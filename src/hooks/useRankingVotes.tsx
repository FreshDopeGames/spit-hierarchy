
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMemberStatus } from '@/hooks/useMemberStatus';
import { toast } from 'sonner';
import { RankingItemWithDelta } from './useRankingData';
import { sanitizeInput } from '@/utils/securityUtils';

export const useRankingVotes = () => {
  const { user } = useAuth();
  const { currentStatus, getVoteMultiplier } = useMemberStatus();
  const queryClient = useQueryClient();

  const submitRankingVote = useMutation({
    mutationFn: async ({
      rankingId,
      rapperId
    }: {
      rankingId: string;
      rapperId: string;
    }) => {
      // Security validation
      if (!user) throw new Error('Authentication required');
      
      // Sanitize inputs
      const cleanRankingId = sanitizeInput(rankingId);
      const cleanRapperId = sanitizeInput(rapperId);
      
      if (!cleanRankingId || !cleanRapperId) {
        throw new Error('Invalid input parameters');
      }

      const voteWeight = getVoteMultiplier();

      // Insert the ranking vote with proper error handling
      const { data: voteData, error: voteError } = await supabase
        .from('ranking_votes')
        .upsert({
          user_id: user.id,
          ranking_id: cleanRankingId,
          rapper_id: cleanRapperId,
          vote_weight: voteWeight,
          member_status: currentStatus,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,ranking_id,rapper_id'
        })
        .select()
        .single();

      if (voteError) {
        console.error('Vote submission error:', voteError);
        throw new Error('Failed to submit vote. Please try again.');
      }

      // Also insert into daily vote tracking with error handling
      const { error: dailyError } = await supabase
        .from('daily_vote_tracking')
        .upsert({
          user_id: user.id,
          ranking_id: cleanRankingId,
          rapper_id: cleanRapperId,
          vote_date: new Date().toISOString().split('T')[0]
        }, {
          onConflict: 'user_id,rapper_id,ranking_id,vote_date'
        });

      if (dailyError) {
        console.error('Daily tracking error:', dailyError);
        // Don't throw here as the main vote succeeded
      }

      return voteData;
    },
    onMutate: async ({ rankingId, rapperId }) => {
      const voteWeight = getVoteMultiplier();
      
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['ranking-data-with-deltas', rankingId] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<RankingItemWithDelta[]>(['ranking-data-with-deltas', rankingId]);

      // Always apply optimistic update for immediate feedback
      queryClient.setQueryData<RankingItemWithDelta[]>(
        ['ranking-data-with-deltas', rankingId],
        (oldData) => {
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

      // Show immediate feedback toast
      toast.loading(`Processing your ${currentStatus} vote (${voteWeight}x weight)...`, {
        id: `vote-${rapperId}`,
        duration: 2000
      });

      return { previousData, voteWeight };
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousData) {
        queryClient.setQueryData(
          ['ranking-data-with-deltas', variables.rankingId],
          context.previousData
        );
      }
      
      // Dismiss loading toast and show error
      toast.dismiss(`vote-${variables.rapperId}`);
      toast.error("Failed to submit vote. Please try again.", {
        duration: 4000
      });
      
      console.error('Vote submission failed:', error);
    },
    onSuccess: (_, variables, context) => {
      const voteWeight = context?.voteWeight || getVoteMultiplier();
      
      // Dismiss loading toast
      toast.dismiss(`vote-${variables.rapperId}`);
      
      // Show success toast with enhanced information
      toast.success(`Vote counted! Your ${currentStatus} status gives ${voteWeight}x voting power`, {
        description: "Rankings updated in real-time",
        duration: 3000,
        action: {
          label: "View Rankings",
          onClick: () => {
            // Could scroll to updated position or refresh view
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      });

      // Clear pending states
      queryClient.setQueryData<RankingItemWithDelta[]>(
        ['ranking-data-with-deltas', variables.rankingId],
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.map(item => ({
            ...item,
            isPending: false
          }));
        }
      );

      // Invalidate relevant queries for real-time updates
      queryClient.invalidateQueries({ queryKey: ['member-status', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-achievement-progress', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-recent-ranking-votes', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['top-active-rankings-for-sections'] });
      
      // Invalidate daily votes cache
      const today = new Date().toISOString().split('T')[0];
      queryClient.invalidateQueries({ queryKey: ['daily-votes', user?.id, today, variables.rankingId] });
    }
  });

  return {
    submitRankingVote,
    getVoteMultiplier,
    currentStatus
  };
};
