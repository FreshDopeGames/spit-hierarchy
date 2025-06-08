
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type UserRankingItem = Tables<"user_ranking_items"> & {
  rapper: Tables<"rappers">;
};

export const useUserRankingItems = (rankingId: string) => {
  return useQuery({
    queryKey: ["user-ranking-items", rankingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_ranking_items")
        .select(`
          *,
          rapper:rappers(*)
        `)
        .eq("ranking_id", rankingId)
        .order("position", { ascending: true });

      if (error) throw error;
      return data as UserRankingItem[];
    },
    enabled: !!rankingId,
  });
};

export const useUpdateUserRankingItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      id,
      updates
    }: {
      id: string;
      updates: Partial<Tables<"user_ranking_items">>;
    }) => {
      const { data, error } = await supabase
        .from("user_ranking_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate both the specific ranking items and the main rankings list
      queryClient.invalidateQueries({ queryKey: ["user-ranking-items"] });
      queryClient.invalidateQueries({ queryKey: ["user-rankings"] });
    }
  });
};

export const useUpdateUserRankingPositions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      rankingId,
      updates
    }: {
      rankingId: string;
      updates: Array<{ id: string; position: number; is_ranked?: boolean }>;
    }) => {
      // Update multiple items in a transaction-like fashion
      const updatePromises = updates.map(update => 
        supabase
          .from("user_ranking_items")
          .update({ 
            position: update.position,
            is_ranked: update.is_ranked ?? undefined
          })
          .eq("id", update.id)
      );

      const results = await Promise.all(updatePromises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} items`);
      }

      return results.map(result => result.data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["user-ranking-items", variables.rankingId] 
      });
      queryClient.invalidateQueries({ queryKey: ["user-rankings"] });
    }
  });
};
