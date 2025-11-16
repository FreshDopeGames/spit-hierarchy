-- Fix The Pharcyde's discography by re-linking classic albums and updating aliases

-- Step 1: Update The Pharcyde's aliases to include member names for better artist-credit matching
UPDATE public.rappers 
SET aliases = ARRAY['Pharcyde', 'Imani', 'Slimkid3', 'Bootie Brown', 'Fatlip']
WHERE slug = 'the-pharcyde';

-- Step 2: Re-link the 4 classic albums that were incorrectly removed by reconciliation
-- These albums still exist in the albums table, we just need to restore the rapper_albums links
INSERT INTO public.rapper_albums (rapper_id, album_id, role)
SELECT 
  r.id as rapper_id,
  a.id as album_id,
  'primary' as role
FROM public.rappers r
CROSS JOIN public.albums a
WHERE r.slug = 'the-pharcyde'
  AND a.musicbrainz_id IN (
    'c799ef0c-f038-364b-972b-51f52d794781',  -- Bizarre Ride II the Pharcyde (1992)
    'd0dc0be5-53ec-3810-8683-ba1dfac644f8',  -- Labcabincalifornia (1995)
    '85afc0a2-2b3d-31cb-abd1-0c4eadae48a4',  -- Plain Rap (2000)
    '134f73dd-53c3-30ec-bbc4-e7f322fbe9e7'   -- Humboldt Beginnings (2004)
  )
ON CONFLICT (rapper_id, album_id) DO NOTHING;

-- Step 3: Update discography_last_updated to NULL to allow fresh fetch
UPDATE public.rappers
SET discography_last_updated = NULL
WHERE slug = 'the-pharcyde';