-- Update get_album_with_tracks to include cached_cover_url
DROP FUNCTION IF EXISTS public.get_album_with_tracks(uuid);

CREATE OR REPLACE FUNCTION public.get_album_with_tracks(album_uuid uuid)
RETURNS TABLE(
  album_id uuid,
  album_title text,
  album_slug text,
  release_date date,
  release_type text,
  cover_art_url text,
  cached_cover_url text,
  track_count integer,
  external_cover_links jsonb,
  tracks jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    a.id as album_id,
    a.title as album_title,
    a.slug as album_slug,
    a.release_date,
    a.release_type,
    a.cover_art_url,
    a.cached_cover_url,
    a.track_count,
    a.external_cover_links,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', t.id,
          'track_number', t.track_number,
          'title', t.title,
          'duration_ms', t.duration_ms,
          'vote_count', COALESCE(vc.vote_count, 0),
          'user_has_voted', EXISTS(
            SELECT 1 FROM track_votes tv 
            WHERE tv.track_id = t.id AND tv.user_id = auth.uid()
          )
        ) ORDER BY t.track_number
      ) FILTER (WHERE t.id IS NOT NULL),
      '[]'::jsonb
    ) as tracks
  FROM public.albums a
  LEFT JOIN public.album_tracks t ON a.id = t.album_id
  LEFT JOIN public.track_vote_counts vc ON t.id = vc.track_id
  WHERE a.id = album_uuid
  GROUP BY a.id, a.title, a.slug, a.release_date, a.release_type, a.cover_art_url, a.cached_cover_url, a.track_count, a.external_cover_links;
$$;