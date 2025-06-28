
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
      // Enhanced security validation
      if (!user) throw new Error('Authentication required');
      
      // Sanitize and validate inputs
      const cleanRankingId = sanitizeInput(rankingId);
      const cleanRapperId = sanitizeInput(rapperId);
      
      if (!cleanRankingId || !cleanRapperId) {
        throw new Error('Invalid input parameters');
      }

      // Additional UUID format validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(cleanRankingId) || !uuidRegex.test(cleanRapperId)) {
        throw new Error('Invalid ID format');
      }

      const voteWeight = getVoteMultiplier();

      // Enhanced security: Check if user is trying to vote too frequently
      const { data: recentVotes, error: voteCheckError } = await supabase
        .from('ranking_votes')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 60000).toISOString()) // Last minute
        .limit(10);

      if (voteCheckError) {
        console.error('Vote check error:', voteCheckError);
      } else if (recentVotes && recentVotes.length >= 5) {
        throw new Error('Too many votes in a short time. Please wait a moment.');
      }

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

      // Show immediate feedback toast with enhanced security context
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
      
      // Update the existing toast to show error instead of dismissing and creating new
      const errorMessage = error.message.includes('Authentication') 
        ? "Please sign in to vote"
        : error.message.includes('Invalid') 
          ? "Invalid request. Please refresh and try again."
          : error.message.includes('Too many')
            ? "Please wait a moment before voting again"
            : "Failed to submit vote. Please try again.";
      
      toast.error(errorMessage, {
        id: `vote-${variables.rapperId}`,
        duration: 4000
      });
      
      console.error('Vote submission failed:', error);
    },
    onSuccess: (_, variables, context) => {
      const voteWeight = context?.voteWeight || getVoteMultiplier();
      
      // Update the existing toast to show success instead of dismissing and creating new
      toast.success(`Vote counted! Your ${currentStatus} status gives ${voteWeight}x voting power`, {
        id: `vote-${variables.rapperId}`,
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
