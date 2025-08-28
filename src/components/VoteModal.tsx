
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ThemedButton } from "@/components/ui/themed-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
import { Star } from "lucide-react";
import { toast } from "sonner";
import CategorySelector from "./vote/CategorySelector";
import RatingSlider from "./vote/RatingSlider";
import { Tables } from "@/integrations/supabase/types";

type Rapper = Tables<"rappers">;

interface VoteModalProps {
  rapper: Rapper;
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
}

const VoteModal = ({ rapper, isOpen, onClose, selectedCategory }: VoteModalProps) => {
  const { user } = useAuth();
  const [category, setCategory] = useState(selectedCategory);
  const [rating, setRating] = useState([5]);
  const queryClient = useQueryClient();

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
    },
  });

  const { data: existingVote } = useQuery({
    queryKey: ["existing-vote", rapper.id, category, user?.id],
    queryFn: async () => {
      if (!user || !category) return null;
      
      const { data, error } = await supabase
        .from("votes")
        .select("*")
        .eq("user_id", user.id)
        .eq("rapper_id", rapper.id)
        .eq("category_id", category)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!category,
  });

  const voteMutation = useMutation({
    mutationFn: async () => {
      if (!user || !category) throw new Error("Missing required data");

      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from("votes")
          .update({ 
            rating: rating[0],
            updated_at: new Date().toISOString()
          })
          .eq("id", existingVote.id);
        
        if (error) throw error;
      } else {
        // Create new vote
        const { error } = await supabase
          .from("votes")
          .insert({
            user_id: user.id,
            rapper_id: rapper.id,
            category_id: category,
            rating: rating[0],
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(existingVote ? "Vote updated successfully!" : "Vote submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["rapper-category-ratings", rapper.id] });
      queryClient.invalidateQueries({ queryKey: ["existing-vote"] });
      queryClient.invalidateQueries({ queryKey: ["rapper"] });
      onClose();
    },
    onError: (error: any) => {
      console.error("Vote submission error:", error);
      toast.error("Failed to submit vote. Please try again.");
    },
  });

  const handleSubmit = () => {
    if (!user) {
      toast.error("Please sign in to vote");
      return;
    }
    
    if (!category) {
      toast.error("Please select a skill");
      return;
    }

    voteMutation.mutate();
  };

  // Set initial rating when existing vote loads
  useEffect(() => {
    if (existingVote) {
      setRating([existingVote.rating]);
    }
  }, [existingVote]);

  if (!categories) {
    return null;
  }

  const selectedCategoryData = categories.find(cat => cat.id === category);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-[var(--theme-background)] border-[var(--theme-border)]/30">
        <DialogHeader className="space-y-0 pb-4">
          <DialogTitle className="text-[var(--theme-text)] font-[var(--theme-font-heading)] text-xl">
            Rate {rapper.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <CategorySelector
            categoryId={category}
            setCategoryId={setCategory}
            categories={categories}
            selectedCategoryData={selectedCategoryData}
          />

          {selectedCategoryData && (
            <ThemedCard className="bg-[var(--theme-backgroundLight)]">
              <ThemedCardContent className="p-4">
                <h3 className="font-semibold text-[var(--theme-text)] mb-2 font-[var(--theme-font-body)]">
                  {selectedCategoryData.name}
                </h3>
                <p className="text-sm text-[var(--theme-textMuted)] font-[var(--theme-font-body)]">
                  {selectedCategoryData.description}
                </p>
              </ThemedCardContent>
            </ThemedCard>
          )}

          <RatingSlider
            rating={rating}
            setRating={setRating}
          />

          <div className="flex items-center gap-2 text-[var(--theme-primary)]">
            <Star className="w-5 h-5 fill-current" />
            <span className="font-semibold font-[var(--theme-font-body)]">
              {rating[0]}/10
            </span>
          </div>

          <ThemedButton
            onClick={handleSubmit}
            disabled={!category || voteMutation.isPending}
            variant="secondary"
            className="w-full"
          >
            {voteMutation.isPending ? "Submitting..." : existingVote ? "Update Vote" : "Submit Vote"}
          </ThemedButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoteModal;
