import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Map of album track id -> YouTube video id (only matched tracks). Triggers matching for unchecked tracks once. */
export const useTrackVideos = (albumId: string | undefined, trackIds: string[]) => {
  const queryClient = useQueryClient();
  const requested = useRef(false);

  const query = useQuery({
    queryKey: ["track-videos", albumId, trackIds.length],
    enabled: !!albumId && trackIds.length > 0,
    staleTime: 60 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("track_youtube_matches")
        .select("track_id, youtube_video_id, status")
        .in("track_id", trackIds);
      if (error) throw error;
      const map: Record<string, string> = {};
      let checked = 0;
      for (const row of data ?? []) {
        checked++;
        if (row.youtube_video_id) map[row.track_id] = row.youtube_video_id;
      }
      return { map, unchecked: trackIds.length - checked };
    },
  });

  useEffect(() => {
    if (!albumId || requested.current || !query.data || query.data.unchecked === 0) return;
    requested.current = true;
    supabase.functions
      .invoke("match-track-youtube", { body: { album_id: albumId } })
      .then(() => queryClient.invalidateQueries({ queryKey: ["track-videos", albumId] }))
      .catch(() => undefined);
  }, [albumId, query.data, queryClient]);

  return query.data?.map ?? {};
};
