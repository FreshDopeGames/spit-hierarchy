-- Add slug column to albums table
ALTER TABLE public.albums
ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Create function to generate slug from album title
CREATE OR REPLACE FUNCTION generate_album_slug(album_title text, album_id uuid)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Generate base slug from title
  base_slug := lower(regexp_replace(album_title, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  final_slug := base_slug;
  
  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM public.albums WHERE slug = final_slug AND id != album_id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::text;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Backfill slugs for existing albums
UPDATE public.albums
SET slug = generate_album_slug(title, id)
WHERE slug IS NULL;

-- Create album_tracks table
CREATE TABLE IF NOT EXISTS public.album_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  track_number integer NOT NULL,
  title text NOT NULL,
  duration_ms integer,
  musicbrainz_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(album_id, track_number)
);

CREATE INDEX IF NOT EXISTS idx_album_tracks_album_id ON public.album_tracks(album_id);
CREATE INDEX IF NOT EXISTS idx_album_tracks_track_number ON public.album_tracks(album_id, track_number);

ALTER TABLE public.album_tracks ENABLE ROW LEVEL SECURITY;

-- RLS policies for album_tracks
CREATE POLICY "Public read access to album tracks"
ON public.album_tracks FOR SELECT
TO public
USING (true);

CREATE POLICY "Admin manage album tracks"
ON public.album_tracks FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Create track_votes table
CREATE TABLE IF NOT EXISTS public.track_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid NOT NULL REFERENCES public.album_tracks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(track_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_track_votes_track_id ON public.track_votes(track_id);
CREATE INDEX IF NOT EXISTS idx_track_votes_user_id ON public.track_votes(user_id);

ALTER TABLE public.track_votes ENABLE ROW LEVEL SECURITY;

-- RLS policies for track_votes
CREATE POLICY "Users can insert their own track votes"
ON public.track_votes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own track votes"
ON public.track_votes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own track votes"
ON public.track_votes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create track_vote_counts view
CREATE OR REPLACE VIEW public.track_vote_counts AS
SELECT
  track_id,
  COUNT(*) as vote_count
FROM public.track_votes
GROUP BY track_id;

-- Function to get album with tracks and vote data
CREATE OR REPLACE FUNCTION public.get_album_with_tracks(album_uuid uuid)
RETURNS TABLE(
  album_id uuid,
  album_title text,
  album_slug text,
  release_date date,
  release_type text,
  cover_art_url text,
  track_count integer,
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
    a.track_count,
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
  GROUP BY a.id, a.title, a.slug, a.release_date, a.release_type, a.cover_art_url, a.track_count;
$$;

-- Function to toggle track vote
CREATE OR REPLACE FUNCTION public.toggle_track_vote(track_uuid uuid, user_uuid uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  vote_exists boolean;
  new_vote_count integer;
BEGIN
  -- Check if user is authenticated
  IF user_uuid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
  END IF;
  
  -- Check if vote exists
  SELECT EXISTS(
    SELECT 1 FROM public.track_votes 
    WHERE track_id = track_uuid AND user_id = user_uuid
  ) INTO vote_exists;
  
  IF vote_exists THEN
    -- Remove vote
    DELETE FROM public.track_votes 
    WHERE track_id = track_uuid AND user_id = user_uuid;
  ELSE
    -- Add vote
    INSERT INTO public.track_votes (track_id, user_id)
    VALUES (track_uuid, user_uuid);
  END IF;
  
  -- Get new vote count
  SELECT COALESCE(COUNT(*), 0)::integer INTO new_vote_count
  FROM public.track_votes
  WHERE track_id = track_uuid;
  
  RETURN jsonb_build_object(
    'success', true,
    'vote_exists', NOT vote_exists,
    'vote_count', new_vote_count
  );
END;
$$;