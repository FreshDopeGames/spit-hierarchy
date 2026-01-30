-- =============================================
-- Phase 1: Create track_artists table
-- Stores all artist credits from MusicBrainz for each track
-- =============================================

CREATE TABLE public.track_artists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID NOT NULL REFERENCES public.album_tracks(id) ON DELETE CASCADE,
  artist_name TEXT NOT NULL,
  musicbrainz_artist_id TEXT,
  join_phrase TEXT, -- " feat. ", " & ", " and ", etc.
  is_primary BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 1,
  rapper_id UUID REFERENCES public.rappers(id) ON DELETE SET NULL, -- NULL if not matched
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_track_artists_track_id ON public.track_artists(track_id);
CREATE INDEX idx_track_artists_rapper_id ON public.track_artists(rapper_id) WHERE rapper_id IS NOT NULL;
CREATE INDEX idx_track_artists_musicbrainz_id ON public.track_artists(musicbrainz_artist_id) WHERE musicbrainz_artist_id IS NOT NULL;
CREATE INDEX idx_track_artists_artist_name ON public.track_artists(artist_name);

-- Unique constraint to prevent duplicate credits
CREATE UNIQUE INDEX idx_track_artists_unique ON public.track_artists(track_id, musicbrainz_artist_id) WHERE musicbrainz_artist_id IS NOT NULL;
CREATE UNIQUE INDEX idx_track_artists_unique_name ON public.track_artists(track_id, artist_name, position) WHERE musicbrainz_artist_id IS NULL;

-- Enable RLS
ALTER TABLE public.track_artists ENABLE ROW LEVEL SECURITY;

-- RLS Policies - publicly readable
CREATE POLICY "Track artists are publicly readable"
  ON public.track_artists FOR SELECT
  USING (true);

-- =============================================
-- Phase 2: Create rapper_collaborations table
-- Aggregated collaboration pairs between rappers
-- =============================================

CREATE TABLE public.rapper_collaborations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rapper_id UUID NOT NULL REFERENCES public.rappers(id) ON DELETE CASCADE,
  collaborator_id UUID NOT NULL REFERENCES public.rappers(id) ON DELETE CASCADE,
  collaboration_count INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'track_credit', -- 'track_credit', 'shared_album', 'manual'
  track_ids UUID[] DEFAULT '{}',
  album_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure rapper_id < collaborator_id for consistency (no duplicates)
  CONSTRAINT rapper_collaborations_order_check CHECK (rapper_id < collaborator_id)
);

-- Unique constraint on the pair
CREATE UNIQUE INDEX idx_rapper_collaborations_pair ON public.rapper_collaborations(rapper_id, collaborator_id);

-- Indexes for lookups
CREATE INDEX idx_rapper_collaborations_rapper ON public.rapper_collaborations(rapper_id);
CREATE INDEX idx_rapper_collaborations_collaborator ON public.rapper_collaborations(collaborator_id);
CREATE INDEX idx_rapper_collaborations_count ON public.rapper_collaborations(collaboration_count DESC);

-- Enable RLS
ALTER TABLE public.rapper_collaborations ENABLE ROW LEVEL SECURITY;

-- RLS Policies - publicly readable
CREATE POLICY "Rapper collaborations are publicly readable"
  ON public.rapper_collaborations FOR SELECT
  USING (true);

-- =============================================
-- Phase 3: Matching function
-- Links track_artists to rappers by MBID, name, or alias
-- =============================================

CREATE OR REPLACE FUNCTION public.match_track_artists_to_rappers()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  matched_count INTEGER := 0;
BEGIN
  -- Match by MusicBrainz ID first (most reliable)
  UPDATE track_artists ta
  SET rapper_id = r.id, updated_at = now()
  FROM rappers r
  WHERE ta.rapper_id IS NULL
    AND ta.musicbrainz_artist_id IS NOT NULL
    AND ta.musicbrainz_artist_id = r.musicbrainz_id;
  
  GET DIAGNOSTICS matched_count = ROW_COUNT;
  
  -- Match by exact name (case-insensitive)
  WITH name_matches AS (
    UPDATE track_artists ta
    SET rapper_id = r.id, updated_at = now()
    FROM rappers r
    WHERE ta.rapper_id IS NULL
      AND LOWER(TRIM(ta.artist_name)) = LOWER(TRIM(r.name))
    RETURNING 1
  )
  SELECT matched_count + COUNT(*) INTO matched_count FROM name_matches;
  
  -- Match by alias (check if artist_name matches any alias)
  WITH alias_matches AS (
    UPDATE track_artists ta
    SET rapper_id = r.id, updated_at = now()
    FROM rappers r
    WHERE ta.rapper_id IS NULL
      AND r.aliases IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM unnest(r.aliases) AS alias
        WHERE LOWER(TRIM(ta.artist_name)) = LOWER(TRIM(alias))
      )
    RETURNING 1
  )
  SELECT matched_count + COUNT(*) INTO matched_count FROM alias_matches;
  
  RETURN matched_count;
END;
$$;

-- =============================================
-- Phase 4: Collaboration aggregation function
-- Rebuilds rapper_collaborations from track_artists
-- =============================================

CREATE OR REPLACE FUNCTION public.refresh_rapper_collaborations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count INTEGER := 0;
BEGIN
  -- Clear existing track_credit collaborations (keep manual ones)
  DELETE FROM rapper_collaborations WHERE source = 'track_credit';
  
  -- Insert new collaborations from track_artists
  INSERT INTO rapper_collaborations (rapper_id, collaborator_id, collaboration_count, source, track_ids, album_ids)
  SELECT 
    LEAST(ta1.rapper_id, ta2.rapper_id) AS rapper_id,
    GREATEST(ta1.rapper_id, ta2.rapper_id) AS collaborator_id,
    COUNT(DISTINCT ta1.track_id) AS collaboration_count,
    'track_credit' AS source,
    ARRAY_AGG(DISTINCT ta1.track_id) AS track_ids,
    ARRAY_AGG(DISTINCT at.album_id) AS album_ids
  FROM track_artists ta1
  JOIN track_artists ta2 ON ta1.track_id = ta2.track_id 
    AND ta1.rapper_id < ta2.rapper_id
  JOIN album_tracks at ON ta1.track_id = at.id
  WHERE ta1.rapper_id IS NOT NULL 
    AND ta2.rapper_id IS NOT NULL
  GROUP BY LEAST(ta1.rapper_id, ta2.rapper_id), GREATEST(ta1.rapper_id, ta2.rapper_id)
  ON CONFLICT (rapper_id, collaborator_id) DO UPDATE SET
    collaboration_count = EXCLUDED.collaboration_count,
    track_ids = EXCLUDED.track_ids,
    album_ids = EXCLUDED.album_ids,
    updated_at = now();
  
  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  
  RETURN inserted_count;
END;
$$;

-- =============================================
-- Triggers for updated_at
-- =============================================

CREATE TRIGGER update_track_artists_updated_at
  BEFORE UPDATE ON public.track_artists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rapper_collaborations_updated_at
  BEFORE UPDATE ON public.rapper_collaborations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();