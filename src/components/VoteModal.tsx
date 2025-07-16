
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { X, Star } from "lucide-react";
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
      queryClient.invalidateQueries({ queryKey: ["rapper-category-ratings"] });
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
      toast.error("Please select a category");
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
      <DialogContent className="max-w-md mx-auto bg-rap-carbon border-rap-burgundy/30">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-rap-platinum font-mogra text-xl">
            Rate {rapper.name}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 text-rap-smoke hover:text-rap-platinum"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          <CategorySelector
            categoryId={category}
            setCategoryId={setCategory}
            categories={categories}
            selectedCategoryData={selectedCategoryData}
          />

          {selectedCategoryData && (
            <Card className="bg-rap-carbon-light border-rap-burgundy/20">
              <CardContent className="p-4">
                <h3 className="font-semibold text-rap-platinum mb-2 font-kaushan">
                  {selectedCategoryData.name}
                </h3>
                <p className="text-sm text-rap-smoke font-kaushan">
                  {selectedCategoryData.description}
                </p>
              </CardContent>
            </Card>
          )}

          <RatingSlider
            rating={rating}
            setRating={setRating}
          />

          <div className="flex items-center gap-2 text-rap-gold">
            <Star className="w-5 h-5 fill-current" />
            <span className="font-semibold font-kaushan">
              {rating[0]}/10
            </span>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!category || voteMutation.isPending}
            className="w-full bg-rap-burgundy hover:bg-rap-burgundy/80 text-rap-platinum font-kaushan"
          >
            {voteMutation.isPending ? "Submitting..." : existingVote ? "Update Vote" : "Submit Vote"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoteModal;
