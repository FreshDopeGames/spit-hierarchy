
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useToast } from "@/components/ui/use-toast";
import { validateContent } from "@/utils/contentModeration";
import { generateSlug } from "@/utils/userRankingUtils";
import { 
  fetchUserRankings, 
  createUserRanking, 
  updateUserRanking, 
  deleteUserRanking 
} from "@/services/userRankingService";
import { CreateUserRankingData } from "@/types/userRanking";
import { Tables } from "@/integrations/supabase/types";

export const useUserRankings = () => {
  return useQuery({
    queryKey: ["user-rankings"],
    queryFn: fetchUserRankings
  });
};

export const useCreateUserRanking = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (rankingData: CreateUserRankingData) => {
      if (!user) {
        throw new Error("User must be logged in to create rankings");
      }

      // Validate title and description for profanity
      const titleValidation = validateContent(rankingData.title);
      if (!titleValidation.isValid) {
        throw new Error(`Title contains inappropriate content: ${titleValidation.message}`);
      }

      if (rankingData.description) {
        const descValidation = validateContent(rankingData.description);
        if (!descValidation.isValid) {
          throw new Error(`Description contains inappropriate content: ${descValidation.message}`);
        }
      }

      // Generate a slug from the title
      const slug = generateSlug(rankingData.title);

      return createUserRanking(rankingData, user.id, slug);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-rankings"] });
      queryClient.invalidateQueries({ queryKey: ["optimized-user-rankings"] });
      toast({
        title: "Ranking created!",
        description: "Your ranking has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating ranking",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useUpdateUserRanking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<Tables<"user_rankings">> 
    }) => {
      return updateUserRanking(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-rankings"] });
    }
  });
};

export const useDeleteUserRanking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteUserRanking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-rankings"] });
    }
  });
};
