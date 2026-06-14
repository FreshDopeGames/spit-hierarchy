import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface AlbumVotingCategory {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
}

export const useAlbumVotingCategories = () => {
  return useQuery({
    queryKey: ["album-voting-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("album_voting_categories")
        .select("id, name, description, display_order")
        .eq("active", true)
        .order("display_order");
      if (error) throw error;
      return (data || []) as AlbumVotingCategory[];
    },
    staleTime: 1000 * 60 * 60,
  });
};

export const useAlbumRatingStats = (albumId: string | undefined) => {
  return useQuery({
    queryKey: ["album-rating-stats", albumId],
    queryFn: async () => {
      if (!albumId) return { averageRating: null, totalRatings: 0 };
      const { data, error } = await supabase
        .from("albums")
        .select("average_rating, total_ratings")
        .eq("id", albumId)
        .maybeSingle();
      if (error) throw error;
      return {
        averageRating: data?.average_rating != null ? Number(data.average_rating) : null,
        totalRatings: data?.total_ratings ?? 0,
      };
    },
    enabled: !!albumId,
    staleTime: 1000 * 30,
  });
};

export const useUserAlbumVotes = (albumId: string | undefined) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-album-votes", albumId, user?.id],
    queryFn: async () => {
      if (!user || !albumId) return [];
      const { data, error } = await supabase
        .from("album_votes")
        .select("id, category_id, rating")
        .eq("user_id", user.id)
        .eq("album_id", albumId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!albumId,
  });
};

interface SubmitArgs {
  albumId: string;
  ratings: Array<{ categoryId: string; rating: number; existingId?: string }>;
}

export const useSubmitAlbumRatings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ albumId, ratings }: SubmitArgs) => {
      if (!user) throw new Error("Sign in to rate albums");
      const rows = ratings.map((r) => ({
        album_id: albumId,
        user_id: user.id,
        category_id: r.categoryId,
        rating: r.rating,
      }));
      const { data, error } = await supabase
        .from("album_votes")
        .upsert(rows, { onConflict: "user_id,album_id,category_id" })
        .select("id");
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Rating did not save");
      }
      return data;
    },
    onSuccess: (_d, vars) => {
      toast.success("Rating saved");
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["album-rating-stats", vars.albumId] });
        queryClient.invalidateQueries({ queryKey: ["user-album-votes", vars.albumId] });
      }, 500);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save rating");
    },
  });
};
