import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AlbumTrack {
  id: string;
  track_number: number;
  title: string;
  duration_ms: number | null;
  vote_count: number;
  user_has_voted: boolean;
}

interface AlbumDetail {
  album_id: string;
  album_title: string;
  album_slug: string;
  release_date: string | null;
  release_type: string;
  cover_art_url: string | null;
  track_count: number | null;
  tracks: AlbumTrack[];
  rapper_id?: string;
  rapper_name?: string;
  rapper_slug?: string;
}

export const useAlbumDetail = (rapperSlug: string, albumSlug: string) => {
  return useQuery({
    queryKey: ["album-detail", rapperSlug, albumSlug],
    queryFn: async () => {
      // First, get the rapper by slug
      const { data: rapper, error: rapperError } = await supabase
        .from("rappers")
        .select("id, name, slug")
        .eq("slug", rapperSlug)
        .single();

      if (rapperError || !rapper) {
        throw new Error("Rapper not found");
      }

      // Get the album by slug and rapper
      const { data: album, error: albumError } = await supabase
        .from("albums")
        .select("id")
        .eq("slug", albumSlug)
        .single();

      if (albumError || !album) {
        throw new Error("Album not found");
      }

      // Check if this album belongs to this rapper
      const { data: rapperAlbum, error: rapperAlbumError } = await supabase
        .from("rapper_albums")
        .select("*")
        .eq("rapper_id", rapper.id)
        .eq("album_id", album.id)
        .single();

      if (rapperAlbumError || !rapperAlbum) {
        throw new Error("Album not found for this rapper");
      }

      // Get full album details with tracks
      const { data: albumDetails, error: detailsError } = await supabase
        .rpc("get_album_with_tracks", { album_uuid: album.id });

      if (detailsError) {
        throw detailsError;
      }

      if (!albumDetails || albumDetails.length === 0) {
        throw new Error("Album details not found");
      }

      const result = albumDetails[0];

      return {
        album_id: result.album_id,
        album_title: result.album_title,
        album_slug: result.album_slug,
        release_date: result.release_date,
        release_type: result.release_type,
        cover_art_url: result.cover_art_url,
        track_count: result.track_count,
        tracks: (Array.isArray(result.tracks) ? result.tracks : []) as unknown as AlbumTrack[],
        rapper_id: rapper.id,
        rapper_name: rapper.name,
        rapper_slug: rapper.slug,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};
