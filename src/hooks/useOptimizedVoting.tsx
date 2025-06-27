
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSecurityContext } from './useSecurityContext';
import { toast } from 'sonner';

interface VoteData {
  rapper_id: string;
  category_id: string;
  rating: number;
}

export const useOptimizedVoting = () => {
  const [isVoting, setIsVoting] = useState(false);
  const { checkRateLimit } = useSecurityContext();
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: async (voteData: VoteData) => {
      // Check rate limit before voting
      const canVote = await checkRateLimit('vote', 20, 3600); // 20 votes per hour
      if (!canVote) {
        throw new Error('Rate limit exceeded. Please wait before voting again.');
      }

      setIsVoting(true);

      const { data, error } = await supabase
        .from('votes')
        .insert({
          rapper_id: voteData.rapper_id,
          category_id: voteData.category_id,
          rating: voteData.rating,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries for performance
      queryClient.invalidateQueries({ queryKey: ['votes'] });
      queryClient.invalidateQueries({ queryKey: ['rapper-stats', data.rapper_id] });
      queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
      
      toast.success('Vote submitted successfully!');
    },
    onError: (error: Error) => {
      console.error('Voting error:', error);
      toast.error(error.message || 'Failed to submit vote');
    },
    onSettled: () => {
      setIsVoting(false);
    }
  });

  return {
    submitVote: voteMutation.mutate,
    isVoting: isVoting || voteMutation.isPending,
    error: voteMutation.error
  };
};
