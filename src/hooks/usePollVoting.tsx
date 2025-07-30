import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { toast } from "sonner";

interface VoteData {
  pollId: string;
  optionIds: string[];
}

export const usePollVoting = () => {
  const { user } = useSecureAuth();
  const queryClient = useQueryClient();

  const submitVote = useMutation({
    mutationFn: async ({ pollId, optionIds }: VoteData) => {
      // Generate session ID for anonymous users
      const sessionId = !user ? `session_${Date.now()}_${Math.random()}` : null;
      
      // Insert votes for each selected option
      const votes = optionIds.map(optionId => ({
        poll_id: pollId,
        option_id: optionId,
        user_id: user?.id || null,
        session_id: sessionId
      }));

      const { error } = await supabase
        .from('poll_votes')
        .insert(votes);

      if (error) throw error;
      
      return votes;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poll-results'] });
      queryClient.invalidateQueries({ queryKey: ['poll-votes'] });
      toast.success("Your vote has been recorded!");
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error("You have already voted on this poll!");
      } else {
        toast.error("Failed to submit vote. Please try again.");
      }
    }
  });

  return {
    submitVote: submitVote.mutateAsync,
    isSubmitting: submitVote.isPending
  };
};