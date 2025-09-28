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
import { Star, CheckCircle, CircleDot } from "lucide-react";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import RatingSlider from "./vote/RatingSlider";

type Rapper = Tables<"rappers">;
type VotingCategory = Tables<"voting_categories">;

interface VoteModalProps {
  rapper: Rapper;
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
}

interface CategoryRating {
  categoryId: string;
  rating: number;
  existingVoteId?: string;
  hasVoted: boolean;
}

const VoteModal = ({ rapper, isOpen, onClose, selectedCategory }: VoteModalProps) => {
  const { user } = useAuth();
  const [categoryRatings, setCategoryRatings] = useState<Map<string, CategoryRating>>(new Map());
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ["voting-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voting_categories")
        .select("*")
        .eq("active", true)
        .neq("name", "Overall") // Exclude Overall category
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: existingVotes } = useQuery({
    queryKey: ["existing-votes", rapper.id, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("votes")
        .select("*")
        .eq("user_id", user.id)
        .eq("rapper_id", rapper.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Initialize category ratings when data loads
  useEffect(() => {
    if (categories && existingVotes !== undefined) {
      const newCategoryRatings = new Map<string, CategoryRating>();
      
      categories.forEach((category) => {
        const existingVote = existingVotes?.find(vote => vote.category_id === category.id);
        newCategoryRatings.set(category.id, {
          categoryId: category.id,
          rating: existingVote?.rating || 1,
          existingVoteId: existingVote?.id,
          hasVoted: !!existingVote,
        });
      });
      
      setCategoryRatings(newCategoryRatings);
    }
  }, [categories, existingVotes]);

  const updateCategoryRating = (categoryId: string, rating: number) => {
    setCategoryRatings(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(categoryId);
      if (current) {
        newMap.set(categoryId, { ...current, rating });
      }
      return newMap;
    });
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");

      // Process each category rating
      for (const [, categoryRating] of categoryRatings) {
        if (categoryRating.existingVoteId) {
          // Update existing vote
          const { error } = await supabase
            .from("votes")
            .update({ 
              rating: categoryRating.rating,
              updated_at: new Date().toISOString()
            })
            .eq("id", categoryRating.existingVoteId);
          
          if (error) throw error;
        } else {
          // Create new vote
          const { error } = await supabase
            .from("votes")
            .insert({
              user_id: user.id,
              rapper_id: rapper.id,
              category_id: categoryRating.categoryId,
              rating: categoryRating.rating,
            });
          
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      const totalVotes = categoryRatings.size;
      const newVotes = Array.from(categoryRatings.values()).filter(r => !r.hasVoted).length;
      const updatedVotes = totalVotes - newVotes;
      
      if (newVotes > 0 && updatedVotes > 0) {
        toast.success(`Submitted ${newVotes} new ratings and updated ${updatedVotes} existing ratings!`);
      } else if (newVotes > 0) {
        toast.success(`Submitted ${newVotes} new rating${newVotes !== 1 ? 's' : ''}!`);
      } else {
        toast.success(`Updated ${updatedVotes} rating${updatedVotes !== 1 ? 's' : ''}!`);
      }
      
      queryClient.invalidateQueries({ queryKey: ["rapper-category-ratings", rapper.id] });
      queryClient.invalidateQueries({ queryKey: ["existing-votes"] });
      queryClient.invalidateQueries({ queryKey: ["rapper"] });
      onClose();
    },
    onError: (error: any) => {
      console.error("Vote submission error:", error);
      toast.error("Failed to submit votes. Please try again.");
    },
  });

  const handleSubmit = () => {
    if (!user) {
      toast.error("Please sign in to vote");
      return;
    }
    
    submitMutation.mutate();
  };

  if (!categories) {
    return null;
  }

  const ratedCount = Array.from(categoryRatings.values()).filter(r => r.hasVoted || r.rating !== 1).length;
  const totalCount = categories.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl mx-auto bg-gradient-to-br from-[hsl(var(--theme-background))] via-[hsl(var(--theme-backgroundLight))] to-[hsl(var(--theme-surface))] border-[var(--theme-border)]/30 max-h-[90vh] overflow-hidden [&>button]:z-30">
        <DialogHeader className="space-y-2 pb-4 sticky top-0 bg-gradient-to-br from-[hsl(var(--theme-background))] via-[hsl(var(--theme-backgroundLight))] to-[hsl(var(--theme-surface))] backdrop-blur-sm z-20 -mx-6 px-6 pt-6 shadow-lg border-b border-[var(--theme-border)]/20">
          <DialogTitle className="text-[var(--theme-text)] font-[var(--theme-font-heading)] text-xl text-center">
            Rate {rapper.name}
          </DialogTitle>
          <div className="flex items-center justify-center gap-2 text-xs text-[var(--theme-textMuted)] font-[var(--theme-font-body)]">
            <CircleDot className="w-3 h-3" />
            <span>{ratedCount} of {totalCount} skills rated</span>
          </div>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto px-6 py-2 -mx-6 max-h-[50vh]">
          {categories.map((category) => {
            const categoryRating = categoryRatings.get(category.id);
            const isRated = categoryRating?.hasVoted || (categoryRating?.rating !== 1);
            
            return (
              <ThemedCard key={category.id} className={`bg-[var(--theme-backgroundLight)] border-l-4 ${
                isRated 
                  ? 'border-l-[hsl(var(--theme-primary))] bg-[hsl(var(--theme-primary))]/5' 
                  : 'border-l-[hsl(var(--theme-border))]'
              } transition-all duration-200`}>
                <ThemedCardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[var(--theme-text)] font-[var(--theme-font-heading)] text-base leading-tight">
                          {category.name}
                        </h3>
                        {isRated && (
                          <CheckCircle className="w-4 h-4 text-[hsl(var(--theme-primary))] flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-[var(--theme-textMuted)] font-[var(--theme-font-body)] leading-tight">
                        {category.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[var(--theme-primary)] flex-shrink-0">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-bold text-base font-[var(--theme-font-heading)]">
                        {categoryRating?.rating || 1}/10
                      </span>
                    </div>
                  </div>

                  <RatingSlider
                    rating={[categoryRating?.rating || 1]}
                    setRating={(rating) => updateCategoryRating(category.id, rating[0])}
                  />
                </ThemedCardContent>
              </ThemedCard>
            );
          })}
        </div>

        <div className="sticky bottom-0 bg-gradient-to-br from-[hsl(var(--theme-background))] via-[hsl(var(--theme-backgroundLight))] to-[hsl(var(--theme-surface))] backdrop-blur-sm z-20 pt-4 pb-6 border-t border-[var(--theme-border)]/30 -mx-6 px-6 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-[var(--theme-textMuted)] font-[var(--theme-font-body)]">
              Progress: {ratedCount}/{totalCount}
            </div>
            <div className="flex-1 mx-3 bg-[var(--theme-backgroundLight)] rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-secondary))] transition-all duration-300"
                style={{ width: `${(ratedCount / totalCount) * 100}%` }}
              />
            </div>
            <div className="text-xs font-semibold text-[var(--theme-text)] font-[var(--theme-font-body)]">
              {Math.round((ratedCount / totalCount) * 100)}%
            </div>
          </div>

          <ThemedButton
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            variant="gradient"
            className="w-full py-2"
          >
            {submitMutation.isPending ? "Submitting..." : `Submit All Ratings`}
          </ThemedButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoteModal;