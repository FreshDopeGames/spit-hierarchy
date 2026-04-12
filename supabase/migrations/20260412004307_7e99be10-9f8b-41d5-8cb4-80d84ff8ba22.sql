
-- Fix Bow Wow's MusicBrainz ID and career start year
UPDATE public.rappers
SET 
  musicbrainz_id = '6fd44ae7-097d-4979-94ba-5dfc40d9f7ad',
  career_start_year = 2000,
  discography_last_updated = NULL
WHERE id = 'bab8eefa-1596-480e-82bf-c5fa8592d02a';

-- Delete incorrect album links from the Japanese band
DELETE FROM public.rapper_albums
WHERE rapper_id = 'bab8eefa-1596-480e-82bf-c5fa8592d02a';
