
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";
import { useRateLimiting } from "./useRateLimiting";

export const useCreateUserRanking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { checkRateLimit } = useRateLimiting({
    actionType: "create_ranking",
    maxRequests: 5,
    windowMinutes: 60
  });

  return useMutation({
    mutationFn: async (rankingData: {
      title: string;
      description?: string;
      category: string;
      is_public?: boolean;
    }) => {
      if (!user) {
        throw new Error("User must be authenticated");
      }

      // Check rate limit before proceeding
      await checkRateLimit();

      const slug = rankingData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);

      const { data, error } = await supabase
        .from("user_rankings")
        .insert({
          ...rankingData,
          slug,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["optimized-user-rankings"] });
      queryClient.invalidateQueries({ queryKey: ["user-rankings"] });
      toast({
        title: "Success",
        description: "Ranking created successfully!",
      });
    },
    onError: (error: any) => {
      console.error("Error creating ranking:", error);
      if (!error.message.includes("Rate limit")) {
        toast({
          title: "Error",
          description: error.message || "Failed to create ranking",
          variant: "destructive",
        });
      }
    },
  });
};

export const useUpdateUserRanking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { checkRateLimit } = useRateLimiting({
    actionType: "update_ranking",
    maxRequests: 10,
    windowMinutes: 60
  });

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<{
        title: string;
        description: string;
        category: string;
        is_public: boolean;
      }>;
    }) => {
      if (!user) {
        throw new Error("User must be authenticated");
      }

      // Check rate limit before proceeding
      await checkRateLimit();

      const { data, error } = await supabase
        .from("user_rankings")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["optimized-user-rankings"] });
      queryClient.invalidateQueries({ queryKey: ["user-rankings"] });
      toast({
        title: "Success",
        description: "Ranking updated successfully!",
      });
    },
    onError: (error: any) => {
      console.error("Error updating ranking:", error);
      if (!error.message.includes("Rate limit")) {
        toast({
          title: "Error",
          description: error.message || "Failed to update ranking",
          variant: "destructive",
        });
      }
    },
  });
};
