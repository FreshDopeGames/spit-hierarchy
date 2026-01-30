import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TrackArtist {
  id: string;
  track_id: string;
  artist_name: string;
  musicbrainz_artist_id: string | null;
  join_phrase: string | null;
  is_primary: boolean;
  position: number;
  rapper_id: string | null;
  rapper_slug: string | null;
}

export const useTrackArtists = (trackIds: string[]) => {
  return useQuery({
    queryKey: ["track-artists", trackIds],
    queryFn: async () => {
      if (trackIds.length === 0) return {};

      // Fetch track artists with rapper slugs via join
      const { data, error } = await supabase
        .from("track_artists")
        .select(`
          id,
          track_id,
          artist_name,
          musicbrainz_artist_id,
          join_phrase,
          is_primary,
          position,
          rapper_id,
          rappers:rapper_id (
            slug
          )
        `)
        .in("track_id", trackIds)
        .order("position");

      if (error) {
        console.error("Error fetching track artists:", error);
        throw error;
      }

      // Group by track_id for easier lookup
      const artistsByTrack: Record<string, TrackArtist[]> = {};
      
      data?.forEach((artist) => {
        const trackId = artist.track_id;
        if (!artistsByTrack[trackId]) {
          artistsByTrack[trackId] = [];
        }
        
        artistsByTrack[trackId].push({
          id: artist.id,
          track_id: artist.track_id,
          artist_name: artist.artist_name,
          musicbrainz_artist_id: artist.musicbrainz_artist_id,
          join_phrase: artist.join_phrase,
          is_primary: artist.is_primary,
          position: artist.position,
          rapper_id: artist.rapper_id,
          rapper_slug: (artist.rappers as any)?.slug || null,
        });
      });

      return artistsByTrack;
    },
    enabled: trackIds.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
