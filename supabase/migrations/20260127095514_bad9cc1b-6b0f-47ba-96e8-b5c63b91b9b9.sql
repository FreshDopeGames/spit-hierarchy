-- Fix Eve rapper record - wrong MusicBrainz artist linked
-- Current: 66bdd1c9-d1c5-40b7-a487-5061fffbd87d (Japanese Eve)
-- Correct: 1ac10f5e-2079-4435-b78f-dda6ecdeba15 (Eve Jihan Cooper, Ruff Ryders)

-- Remove incorrectly linked albums first (Japanese Eve's discography)
DELETE FROM rapper_albums 
WHERE rapper_id = (SELECT id FROM rappers WHERE slug = 'eve');

-- Update the MusicBrainz ID and career start year
UPDATE rappers
SET 
  musicbrainz_id = '1ac10f5e-2079-4435-b78f-dda6ecdeba15',
  career_start_year = 1999,
  discography_last_updated = NULL
WHERE slug = 'eve';