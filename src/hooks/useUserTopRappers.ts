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

      const { data, error } = await supabase.rpc("set_user_top_rapper", {
        _position: position,
        _rapper_id: rapperId,
      });

      if (error) {
        console.error("[updateTopRapper] rpc error:", error);
        throw error;
      }
      if (!data) {
        throw new Error("Top 5 update returned no row");
      }
      return data as { id: string; position: number; rapper_id: string };
    },
    onMutate: async ({ position, rapperId, rapperData }) => {
      await queryClient.cancelQueries({ queryKey: ["user-top-rappers", user?.id] });
      const previous = queryClient.getQueryData(["user-top-rappers", user?.id]);

      if (rapperData) {
        queryClient.setQueryData(["user-top-rappers", user?.id], (old: any[] | undefined) => {
          const filtered = (old || []).filter(
            (item: any) => item.position !== position && item.rapper_id !== rapperId
          );
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
      const parts = [
        error?.message,
        error?.details,
        error?.hint,
        error?.code ? `code ${error.code}` : null,
      ].filter(Boolean);
      const description = parts.length ? parts.join(" • ") : "Unknown error";
      toast.error("Failed to update your Top 5", { description });
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

      const { data: entries, error: fetchErr } = await supabase
        .from("user_top_rappers")
        .select("id, position, rapper_id")
        .eq("user_id", user.id)
        .in("position", [posA, posB]);

      if (fetchErr) throw fetchErr;

      const entryA = entries?.find((entry) => entry.position === posA);
      const entryB = entries?.find((entry) => entry.position === posB);

      if (!entryA || !entryB) throw new Error("Both positions must have rappers");

      const { data: deletedA, error: deleteErr } = await supabase
        .from("user_top_rappers")
        .delete()
        .eq("id", entryA.id)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle();

      if (deleteErr || !deletedA) {
        throw deleteErr ?? new Error("Failed to reserve the original slot for swapping");
      }

      const { data: movedB, error: updateErr } = await supabase
        .from("user_top_rappers")
        .update({ position: posA })
        .eq("id", entryB.id)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle();

      if (updateErr || !movedB) {
        await supabase.from("user_top_rappers").insert({
          user_id: user.id,
          position: posA,
          rapper_id: entryA.rapper_id,
        });

        throw updateErr ?? new Error("Failed to move the second rapper into place");
      }

      const { data: insertedA, error: insertErr } = await supabase
        .from("user_top_rappers")
        .insert({
          user_id: user.id,
          position: posB,
          rapper_id: entryA.rapper_id,
        })
        .select("id")
        .maybeSingle();

      if (insertErr || !insertedA) {
        await supabase
          .from("user_top_rappers")
          .update({ position: posB })
          .eq("id", entryB.id)
          .eq("user_id", user.id);

        await supabase.from("user_top_rappers").insert({
          user_id: user.id,
          position: posA,
          rapper_id: entryA.rapper_id,
        });

        throw insertErr ?? new Error("Failed to complete the top 5 swap");
      }
    },
    onMutate: async ({ posA, posB }) => {
      await queryClient.cancelQueries({ queryKey: ["user-top-rappers", user?.id] });
      const previous = queryClient.getQueryData(["user-top-rappers", user?.id]);

      queryClient.setQueryData(["user-top-rappers", user?.id], (old: any[] | undefined) => {
        if (!old) return old;

        const copy = old.map((item: any) => ({ ...item }));
        const itemA = copy.find((item: any) => item.position === posA);
        const itemB = copy.find((item: any) => item.position === posB);

        if (itemA && itemB) {
          itemA.position = posB;
          itemB.position = posA;
        }

        return copy.sort((a: any, b: any) => a.position - b.position);
      });

      return { previous };
    },
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["user-top-rappers", user?.id] });
      }, 200);
      toast.success("Top 5 reordered!");
    },
    onError: (error: any, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["user-top-rappers", user?.id], context.previous);
      }

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["user-top-rappers", user?.id] });
      }, 200);

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
