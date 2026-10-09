import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AlbumListenStats {
  total_listen_count: number;
  total_user_count: number;
  top_tracks: { name: string; listen_count: number }[];
  fetched_at: string;
}

export const useAlbumListenStats = (albumId: string | undefined) => {
  return useQuery({
    queryKey: ["album-listen-stats", albumId],
    enabled: !!albumId,
    staleTime: 1000 * 60 * 60, // stats refresh daily; cache for an hour
    queryFn: async (): Promise<AlbumListenStats | null> => {
      const { data, error } = await supabase
        .from("album_listen_stats")
        .select("total_listen_count, total_user_count, top_tracks, fetched_at")
        .eq("album_id", albumId!)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        total_listen_count: data.total_listen_count,
        total_user_count: data.total_user_count,
        top_tracks: Array.isArray(data.top_tracks)
          ? (data.top_tracks as { name: string; listen_count: number }[])
          : [],
        fetched_at: data.fetched_at,
      };
    },
  });
};
