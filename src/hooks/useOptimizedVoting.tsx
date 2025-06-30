
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSecurityContext } from './useSecurityContext';
import { handleError, createAppError } from '@/utils/errorHandler';
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
        throw createAppError('Rate limit exceeded. Please wait before voting again.', 'RATE_LIMIT_EXCEEDED');
      }

      setIsVoting(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw createAppError('You must be logged in to vote', 'AUTH_REQUIRED');
      }

      // Validate rating range
      if (voteData.rating < 1 || voteData.rating > 10) {
        throw createAppError('Rating must be between 1 and 10', 'INVALID_RATING');
      }

      // Check if user already voted for this rapper in this category
      const { data: existingVote, error: checkError } = await supabase
        .from('votes')
        .select('id')
        .eq('user_id', user.id)
        .eq('rapper_id', voteData.rapper_id)
        .eq('category_id', voteData.category_id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingVote) {
        // Update existing vote
        const { data, error } = await supabase
          .from('votes')
          .update({
            rating: voteData.rating,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingVote.id)
          .select()
          .single();

        if (error) throw error;
        return { data, isUpdate: true };
      } else {
        // Insert new vote
        const { data, error } = await supabase
          .from('votes')
          .insert({
            rapper_id: voteData.rapper_id,
            category_id: voteData.category_id,
            rating: voteData.rating,
            user_id: user.id
          })
          .select()
          .single();

        if (error) throw error;
        return { data, isUpdate: false };
      }
    },
    onSuccess: (result) => {
      // Invalidate relevant queries for performance
      queryClient.invalidateQueries({ queryKey: ['votes'] });
      queryClient.invalidateQueries({ queryKey: ['rapper-stats', result.data.rapper_id] });
      queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
      queryClient.invalidateQueries({ queryKey: ['rappers'] });
      
      // Don't show success toast here - let the calling component handle it
      console.log('Vote submitted successfully:', result.data);
    },
    onError: (error) => {
      handleError(error, 'voting');
    },
    onSettled: () => {
      setIsVoting(false);
    }
  });

  return {
    submitVote: voteMutation.mutateAsync, // Use mutateAsync for better error handling
    isVoting: isVoting || voteMutation.isPending,
    error: voteMutation.error
  };
};
