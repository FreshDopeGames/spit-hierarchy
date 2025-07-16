
import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface VoteData {
  rapper_id: string;
  category_id: string;
  rating: number;
}

export const useOptimizedVoting = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitVote = useMutation({
    mutationFn: async ({ rapper_id, category_id, rating }: VoteData) => {
      if (!user) throw new Error("Authentication required");

      // Check if vote already exists
      const { data: existingVote } = await supabase
        .from("votes")
        .select("id")
        .eq("user_id", user.id)
        .eq("rapper_id", rapper_id)
        .eq("category_id", category_id)
        .maybeSingle();

      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from("votes")
          .update({ 
            rating,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingVote.id);
        
        if (error) throw error;
        return { action: 'updated' };
      } else {
        // Create new vote
        const { error } = await supabase
          .from("votes")
          .insert({
            user_id: user.id,
            rapper_id,
            category_id,
            rating,
          });
        
        if (error) throw error;
        return { action: 'created' };
      }
    },
    onSuccess: (result) => {
      toast.success(result.action === 'updated' ? "Vote updated successfully!" : "Vote submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["rapper-category-ratings"] });
      queryClient.invalidateQueries({ queryKey: ["existing-vote"] });
      queryClient.invalidateQueries({ queryKey: ["rapper"] });
    },
    onError: (error: any) => {
      console.error("Vote submission error:", error);
      toast.error("Failed to submit vote. Please try again.");
    },
  });

  const handleVoteSubmission = useCallback(async (voteData: VoteData) => {
    if (!user) {
      toast.error("Please sign in to vote");
      return false;
    }

    setIsSubmitting(true);
    
    try {
      await submitVote.mutateAsync(voteData);
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, submitVote]);

  return {
    handleVoteSubmission,
    isSubmitting: isSubmitting || submitVote.isPending,
  };
};
