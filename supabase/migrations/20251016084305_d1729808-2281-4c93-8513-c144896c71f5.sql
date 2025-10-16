-- Reset discography cache for Homeboy Sandman to force fresh fetch with tracks
UPDATE rappers 
SET discography_last_updated = NULL 
WHERE slug = 'homeboy-sandman';