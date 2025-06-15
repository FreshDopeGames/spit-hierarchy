
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMemberStatus } from '@/hooks/useMemberStatus';
import { useToast } from '@/hooks/use-toast';

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
    onSuccess: (_, variables) => {
      const voteWeight = getVoteMultiplier();
      
      toast({
        title: "Vote submitted!",
        description: `Your ${currentStatus} status vote counts as ${voteWeight} ${voteWeight === 1 ? 'vote' : 'votes'}!`,
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['ranking-data-with-deltas'] });
      queryClient.invalidateQueries({ queryKey: ['ranking-votes'] });
    },
    onError: (error) => {
      console.error('Error submitting ranking vote:', error);
      toast({
        title: "Error",
        description: "Failed to submit vote. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    submitRankingVote,
    getVoteMultiplier,
    currentStatus
  };
};
