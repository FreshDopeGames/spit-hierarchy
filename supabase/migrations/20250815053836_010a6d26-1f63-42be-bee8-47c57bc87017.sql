-- Clean up existing non-studio albums from the database
-- Remove rapper-album associations for excluded album types
DELETE FROM public.rapper_albums 
WHERE album_id IN (
  SELECT id FROM public.albums 
  WHERE secondary_types && ARRAY['Compilation', 'Soundtrack', 'Live', 'Remix', 'Spokenword']::text[]
);

-- Delete the excluded album records
DELETE FROM public.albums 
WHERE secondary_types && ARRAY['Compilation', 'Soundtrack', 'Live', 'Remix', 'Spokenword']::text[];