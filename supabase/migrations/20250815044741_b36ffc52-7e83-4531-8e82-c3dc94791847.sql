-- Clean up albums with null release dates
DELETE FROM public.rapper_albums 
WHERE album_id IN (
  SELECT id FROM public.albums WHERE release_date IS NULL
);

-- Delete albums with null release dates
DELETE FROM public.albums 
WHERE release_date IS NULL;