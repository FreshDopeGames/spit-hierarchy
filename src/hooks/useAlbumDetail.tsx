import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { retry } from "@/utils/errorHandler";
import { useState, useEffect } from "react";

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

const QUERY_TIMEOUT = 10000; // 10 seconds

export const useAlbumDetail = (rapperSlug: string, albumSlug: string) => {
  const [isFetchingTracks, setIsFetchingTracks] = useState(false);

  const query = useQuery({
    queryKey: ["album-detail", rapperSlug, albumSlug],
    queryFn: async () => {
      // Wrap the query with timeout and retry logic
      return retry(async () => {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Query timeout after 10 seconds")), QUERY_TIMEOUT)
        );

        const queryPromise = supabase.rpc("get_album_by_slugs", {
          p_rapper_slug: rapperSlug,
          p_album_slug: albumSlug,
        });

        const { data, error } = await Promise.race([
          queryPromise,
          timeoutPromise,
        ]) as any;

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error("No data returned from server");
        }

        // Check if the RPC function returned an error
        if (data.success === false) {
          throw new Error(data.error || "Failed to load album details");
        }

        const album = data.album;

        return {
          album_id: album.album_id,
          album_title: album.album_title,
          album_slug: album.album_slug,
          release_date: album.release_date,
          release_type: album.release_type,
          cover_art_url: album.cover_art_url,
          track_count: album.track_count,
          tracks: (Array.isArray(album.tracks) ? album.tracks : []) as unknown as AlbumTrack[],
          rapper_id: data.rapper_id,
          rapper_name: data.rapper_name,
          rapper_slug: data.rapper_slug,
        };
      }, 3, 1000); // 3 retries with 1 second initial delay
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!rapperSlug && !!albumSlug && albumSlug !== 'undefined' && albumSlug !== 'null', // Only run if both slugs are valid
  });

  // Auto-fetch tracks if album has no tracks but has data
  useEffect(() => {
    const fetchTracksIfNeeded = async () => {
      if (!query.data || isFetchingTracks) return;
      
      const needsTracks = 
        query.data.track_count === null || 
        (query.data.tracks.length === 0 && query.data.track_count !== 0);

      if (needsTracks) {
        console.log('Album needs tracks, fetching from MusicBrainz...');
        setIsFetchingTracks(true);

        try {
          const { error } = await supabase.functions.invoke('fetch-album-tracks', {
            body: { albumId: query.data.album_id, forceRefresh: false },
          });

          if (error) {
            console.error('Error fetching album tracks:', error);
          } else {
            // Refetch album data to get the newly added tracks
            await query.refetch();
          }
        } catch (error) {
          console.error('Unexpected error fetching tracks:', error);
        } finally {
          setIsFetchingTracks(false);
        }
      }
    };

    fetchTracksIfNeeded();
  }, [query.data, isFetchingTracks]);

  return {
    ...query,
    isFetchingTracks,
  };
};
