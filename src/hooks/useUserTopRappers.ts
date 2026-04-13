import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export const useUserTopRappers = () => {
  const { user } = useAuth();
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
            image_url,
            slug
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
      rapperData,
    }: {
      position: number;
      rapperId: string;
      rapperData?: { id: string; name: string; image_url: string | null; slug: string };
    }) => {
      if (!user) throw new Error("User not authenticated");

      await supabase
        .from("user_top_rappers")
        .delete()
        .eq("user_id", user.id)
        .eq("position", position);

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
    onMutate: async ({ position, rapperId, rapperData }) => {
      await queryClient.cancelQueries({ queryKey: ["user-top-rappers", user?.id] });
      const previous = queryClient.getQueryData(["user-top-rappers", user?.id]);

      if (rapperData) {
        queryClient.setQueryData(["user-top-rappers", user?.id], (old: any[] | undefined) => {
          const filtered = (old || []).filter((item: any) => item.position !== position);
          return [...filtered, { position, rapper_id: rapperId, rappers: rapperData }];
        });
      }

      return { previous };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-top-rappers", user?.id] });
      if (data?.rapper_id) {
        queryClient.invalidateQueries({ queryKey: ["rapper", data.rapper_id] });
      }
      toast.success("Top 5 updated successfully!");
    },
    onError: (error: any, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["user-top-rappers", user?.id], context.previous);
      }
      console.error("Error updating top rapper:", error);
      toast.error("Failed to update your top 5");
    },
  });

  const removeTopRapperMutation = useMutation({
    mutationFn: async (position: number) => {
      if (!user) throw new Error("User not authenticated");

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
      if (data?.rapper_id) {
        queryClient.invalidateQueries({ queryKey: ["rapper", data.rapper_id] });
      }
    },
    onError: (error: any) => {
      console.error("Error removing top rapper:", error);
      toast.error("Failed to remove rapper");
    },
  });

  const swapPositionsMutation = useMutation({
    mutationFn: async ({ posA, posB }: { posA: number; posB: number }) => {
      if (!user) throw new Error("User not authenticated");

      // Get both entries
      const { data: entries, error: fetchErr } = await supabase
        .from("user_top_rappers")
        .select("position, rapper_id")
        .eq("user_id", user.id)
        .in("position", [posA, posB]);

      if (fetchErr) throw fetchErr;

      const entryA = entries?.find(e => e.position === posA);
      const entryB = entries?.find(e => e.position === posB);

      if (!entryA || !entryB) throw new Error("Both positions must have rappers");

      // Use a temporary position to avoid unique constraint violations during swap
      // Step 1: Move A to temp position (999)
      const { error: err1 } = await supabase
        .from("user_top_rappers")
        .update({ position: 999 })
        .eq("user_id", user.id)
        .eq("position", posA);
      if (err1) throw err1;

      // Step 2: Move B to A's position
      const { error: err2 } = await supabase
        .from("user_top_rappers")
        .update({ position: posA })
        .eq("user_id", user.id)
        .eq("position", posB);
      if (err2) throw err2;

      // Step 3: Move temp (A) to B's position
      const { error: err3 } = await supabase
        .from("user_top_rappers")
        .update({ position: posB })
        .eq("user_id", user.id)
        .eq("position", 999);
      if (err3) throw err3;
    },
    onMutate: async ({ posA, posB }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["user-top-rappers", user?.id] });
      const previous = queryClient.getQueryData(["user-top-rappers", user?.id]);

      queryClient.setQueryData(["user-top-rappers", user?.id], (old: any[] | undefined) => {
        if (!old) return old;
        const copy = old.map((item: any) => ({ ...item }));
        const itemA = copy.find((i: any) => i.position === posA);
        const itemB = copy.find((i: any) => i.position === posB);
        if (itemA && itemB) {
          const tmpRapperId = itemA.rapper_id;
          const tmpRappers = itemA.rappers;
          itemA.rapper_id = itemB.rapper_id;
          itemA.rappers = itemB.rappers;
          itemB.rapper_id = tmpRapperId;
          itemB.rappers = tmpRappers;
        }
        return copy;
      });

      return { previous };
    },
    onSuccess: () => {
      // Delay refetch slightly to ensure DB is fully consistent
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["user-top-rappers", user?.id] });
      }, 300);
      toast.success("Top 5 reordered!");
    },
    onError: (error: any, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["user-top-rappers", user?.id], context.previous);
      }
      console.error("Error swapping positions:", error);
      toast.error("Failed to reorder your top 5");
    },
  });

  const selectedRapperIds = topRappers?.map(item => item.rapper_id).filter(Boolean) || [];

  return {
    topRappers: topRappers || [],
    isLoading,
    updateTopRapper: updateTopRapperMutation.mutate,
    removeTopRapper: removeTopRapperMutation.mutate,
    swapPositions: swapPositionsMutation.mutate,
    selectedRapperIds,
    isUpdating: updateTopRapperMutation.isPending || removeTopRapperMutation.isPending || swapPositionsMutation.isPending,
  };
};
