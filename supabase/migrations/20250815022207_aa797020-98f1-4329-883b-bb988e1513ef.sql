-- Clear 2Pac's discography cache for fresh MusicBrainz fetch
-- Delete existing album associations for 2Pac
DELETE FROM public.rapper_albums 
WHERE rapper_id = 'ab50cc01-53d7-4cb1-8ed6-d57a9fd0a109';

-- Delete albums that were only associated with 2Pac
DELETE FROM public.albums 
WHERE id IN (
  'bc8599c8-a806-4ea6-aa8c-5963ea45635d',
  '9ae700b8-8c66-4952-8e09-5c26d322e1fb', 
  'a6338f4d-c58b-4ac5-accb-97055af3b263'
);

-- Reset discography cache timestamp to force fresh fetch
UPDATE public.rappers 
SET discography_last_updated = NULL 
WHERE id = 'ab50cc01-53d7-4cb1-8ed6-d57a9fd0a109';