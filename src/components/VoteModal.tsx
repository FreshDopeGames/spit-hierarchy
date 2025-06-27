import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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

  const voteMutation = useMutation({
    mutationFn: async ({ rating, categoryId }: { rating: number; categoryId: string }) => {
      if (!user) throw new Error("Must be logged in to vote");

      const voteData = {
        user_id: user.id,
        rapper_id: rapper.id,
        category_id: categoryId,
        rating: rating
      };

      if (existingVote) {
        const { data, error } = await supabase
          .from("votes")
          .update({ rating })
          .eq("id", existingVote.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("votes")
          .insert(voteData)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      toast.success(`Your rating for ${rapper.name} has been ${existingVote ? 'updated' : 'recorded'}.`);
      queryClient.invalidateQueries({ queryKey: ["rappers"] });
      queryClient.invalidateQueries({ queryKey: ["user-vote"] });
      queryClient.invalidateQueries({ queryKey: ["rapper-category-ratings"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit vote");
    }
  });

  const handleSubmit = () => {
    if (!categoryId) {
      toast.error("Please select a voting category first.");
      return;
    }

    voteMutation.mutate({ rating: rating[0], categoryId });
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

          <VoteSubmission
            onSubmit={handleSubmit}
            isPending={voteMutation.isPending}
            categoryId={categoryId}
            existingVote={existingVote}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoteModal;
