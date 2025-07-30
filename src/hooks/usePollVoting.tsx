import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { toast } from "sonner";

interface VoteData {
  pollId: string;
  optionIds: string[];
  writeInOption?: string;
}

export const usePollVoting = () => {
  const { user } = useSecureAuth();
  const queryClient = useQueryClient();

  const submitVote = useMutation({
    mutationFn: async ({ pollId, optionIds, writeInOption }: VoteData) => {
      if (!user) {
        throw new Error("Authentication required");
      }

      let finalOptionIds = [...optionIds];

      // Handle write-in option by creating a new poll option
      if (writeInOption) {
        // Get the highest order number for existing options
        const { data: existingOptions } = await supabase
          .from('poll_options')
          .select('option_order')
          .eq('poll_id', pollId)
          .order('option_order', { ascending: false })
          .limit(1);

        const nextOrder = (existingOptions?.[0]?.option_order || 0) + 1;

        // Create new poll option for write-in
        const { data: newOption, error: optionError } = await supabase
          .from('poll_options')
          .insert({
            poll_id: pollId,
            option_text: writeInOption,
            option_order: nextOrder
          })
          .select('id')
          .single();

        if (optionError) throw optionError;
        finalOptionIds.push(newOption.id);
      }
      
      // Insert votes for each selected option (including write-in)
      const votes = finalOptionIds.map(optionId => ({
        poll_id: pollId,
        option_id: optionId,
        user_id: user.id
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