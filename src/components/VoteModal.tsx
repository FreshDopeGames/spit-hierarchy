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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { Star, MapPin, Calendar, Verified } from "lucide-react";
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
  const { toast } = useToast();
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
      toast({
        title: "Vote Submitted!",
        description: `Your rating for ${rapper.name} has been ${existingVote ? 'updated' : 'recorded'}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["rappers"] });
      queryClient.invalidateQueries({ queryKey: ["user-vote"] });
      queryClient.invalidateQueries({ queryKey: ["rapper-category-ratings"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit vote",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    if (!categoryId) {
      toast({
        title: "Select Category",
        description: "Please select a voting category first.",
        variant: "destructive",
      });
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
      <DialogContent className="bg-black/90 border-purple-500/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Rate {rapper.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rapper Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">{rapper.name}</h3>
              {rapper.verified && <Verified className="w-5 h-5 text-blue-500" />}
            </div>
            
            {rapper.real_name && (
              <p className="text-gray-400">{rapper.real_name}</p>
            )}

            <div className="flex flex-wrap gap-3 text-sm">
              {rapper.origin && (
                <div className="flex items-center gap-1 text-gray-300">
                  <MapPin className="w-4 h-4" />
                  <span>{rapper.origin}</span>
                </div>
              )}
              {rapper.birth_year && (
                <div className="flex items-center gap-1 text-gray-300">
                  <Calendar className="w-4 h-4" />
                  <span>{rapper.birth_year}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-white font-semibold">
                {rapper.average_rating || "No ratings yet"}
              </span>
              <span className="text-gray-400">({rapper.total_votes || 0} votes)</span>
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-gray-300">
              Attribute Category
            </Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="bg-black/50 border-purple-500/30">
                <SelectValue placeholder="Select an attribute to rate..." />
              </SelectTrigger>
              <SelectContent className="bg-black border-purple-500/30">
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCategoryData && (
              <p className="text-sm text-gray-400">{selectedCategoryData.description}</p>
            )}
          </div>

          {/* Rating Slider */}
          <div className="space-y-4">
            <Label className="text-gray-300">
              Your Rating: <span className="text-white font-bold text-lg">{rating[0]}/10</span>
              <span className="text-gray-400 text-sm ml-2">
                (≈ {Math.round((rating[0] / 10) * 100)}/100)
              </span>
            </Label>
            <div className="px-2">
              <Slider
                value={rating}
                onValueChange={setRating}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
          </div>

          {existingVote && (
            <div className="text-sm text-purple-400">
              You previously rated this rapper {existingVote.rating}/10 in this category.
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={voteMutation.isPending || !categoryId}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {voteMutation.isPending 
              ? "Submitting..." 
              : existingVote 
                ? "Update Vote" 
                : "Submit Vote"
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoteModal;
