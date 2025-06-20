
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

export const useUserTopRappers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: topRappers, isLoading } = useQuery({
    queryKey: ["user-top-rappers", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_top_rappers")
        .select(`
          position,
          rapper_id,
          rappers (
            id,
            name,
            image_url
          )
        `)
        .eq("user_id", user.id)
        .order("position");
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const updateTopRapperMutation = useMutation({
    mutationFn: async ({
      position,
      rapperId,
    }: {
      position: number;
      rapperId: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      // First, remove any existing entry for this position
      await supabase
        .from("user_top_rappers")
        .delete()
        .eq("user_id", user.id)
        .eq("position", position);

      // Then insert the new rapper
      const { data, error } = await supabase
        .from("user_top_rappers")
        .insert({
          user_id: user.id,
          position,
          rapper_id: rapperId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-top-rappers", user?.id] });
      // Invalidate the specific rapper's detail page to update the Top 5 count
      if (data?.rapper_id) {
        queryClient.invalidateQueries({ queryKey: ["rapper", data.rapper_id] });
      }
      toast({
        title: "Success",
        description: "Top 5 updated successfully!",
      });
    },
    onError: (error: any) => {
      console.error("Error updating top rapper:", error);
      toast({
        title: "Error",
        description: "Failed to update your top 5",
        variant: "destructive",
      });
    },
  });

  const removeTopRapperMutation = useMutation({
    mutationFn: async (position: number) => {
      if (!user) throw new Error("User not authenticated");

      // Get the rapper_id before deleting so we can invalidate their detail page
      const { data: existingEntry } = await supabase
        .from("user_top_rappers")
        .select("rapper_id")
        .eq("user_id", user.id)
        .eq("position", position)
        .single();

      const { error } = await supabase
        .from("user_top_rappers")
        .delete()
        .eq("user_id", user.id)
        .eq("position", position);

      if (error) throw error;
      return existingEntry;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-top-rappers", user?.id] });
      // Invalidate the specific rapper's detail page to update the Top 5 count
      if (data?.rapper_id) {
        queryClient.invalidateQueries({ queryKey: ["rapper", data.rapper_id] });
      }
    },
    onError: (error: any) => {
      console.error("Error removing top rapper:", error);
      toast({
        title: "Error",
        description: "Failed to remove rapper",
        variant: "destructive",
      });
    },
  });

  // Get selected rapper IDs to filter them out from search
  const selectedRapperIds = topRappers?.map(item => item.rapper_id).filter(Boolean) || [];

  return {
    topRappers: topRappers || [],
    isLoading,
    updateTopRapper: updateTopRapperMutation.mutate,
    removeTopRapper: removeTopRapperMutation.mutate,
    selectedRapperIds,
    isUpdating: updateTopRapperMutation.isPending || removeTopRapperMutation.isPending,
  };
};
