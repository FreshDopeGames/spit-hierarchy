
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOptimizedVoting } from "@/hooks/useOptimizedVoting";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import RapperInfo from "./vote/RapperInfo";
import CategorySelector from "./vote/CategorySelector";
import RatingSlider from "./vote/RatingSlider";
import VoteSubmission from "./vote/VoteSubmission";

type Rapper = Tables<"rappers">;

interface VoteModalProps {
  rapper: Rapper;
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
}

const VoteModal = ({ rapper, isOpen, onClose, selectedCategory }: VoteModalProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState([7]);
  const [categoryId, setCategoryId] = useState(selectedCategory);
  const { submitVote, isVoting } = useOptimizedVoting();

  const { data: categories } = useQuery({
    queryKey: ["voting-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voting_categories")
        .select("*")
        .eq("active", true)
        .order("name");

      if (error) throw error;
      return data;
    }
  });

  const { data: existingVote } = useQuery({
    queryKey: ["user-vote", rapper.id, categoryId],
    queryFn: async () => {
      if (!user || !categoryId) return null;
      
      const { data, error } = await supabase
        .from("votes")
        .select("*")
        .eq("user_id", user.id)
        .eq("rapper_id", rapper.id)
        .eq("category_id", categoryId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!categoryId
  });

  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to vote");
      return;
    }

    if (!categoryId) {
      toast.error("Please select a voting category first.");
      return;
    }

    try {
      // Use the optimized voting hook for security and rate limiting
      await submitVote({
        rapper_id: rapper.id,
        category_id: categoryId,
        rating: rating[0]
      });

      // Invalidate specific queries for better performance
      queryClient.invalidateQueries({ queryKey: ["rappers"] });
      queryClient.invalidateQueries({ queryKey: ["rapper", rapper.id] });
      queryClient.invalidateQueries({ queryKey: ["user-vote", rapper.id, categoryId] });
      queryClient.invalidateQueries({ queryKey: ["rapper-category-ratings", rapper.id] });
      
      toast.success(`Your rating for ${rapper.name} has been ${existingVote ? 'updated' : 'recorded'}.`);
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit vote");
    }
  };

  React.useEffect(() => {
    if (existingVote) {
      setRating([existingVote.rating]);
    }
  }, [existingVote]);

  const selectedCategoryData = categories?.find(cat => cat.id === categoryId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-rap-carbon/95 border-rap-gold/30 text-rap-platinum max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-rap-gold to-rap-gold-light bg-clip-text text-transparent font-mogra">
            Rate {rapper.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <RapperInfo rapper={rapper} />
          
          <CategorySelector
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            categories={categories}
            selectedCategoryData={selectedCategoryData}
          />

          <RatingSlider rating={rating} setRating={setRating} />

          {existingVote && (
            <div className="text-sm text-rap-gold font-kaushan bg-rap-carbon/50 p-3 rounded-lg border border-rap-gold/20">
              You previously rated this rapper {existingVote.rating}/10 in this category. Your new rating will replace the previous one.
            </div>
          )}

          <VoteSubmission
            onSubmit={handleSubmit}
            isPending={isVoting}
            categoryId={categoryId}
            existingVote={existingVote}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoteModal;
