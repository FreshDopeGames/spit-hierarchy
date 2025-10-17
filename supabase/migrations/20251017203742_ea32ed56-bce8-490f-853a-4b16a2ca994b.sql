-- Backfill slugs for existing albums with NULL slugs
-- This ensures all albums have unique, URL-safe slugs for album detail pages

DO $$
DECLARE
  album_record RECORD;
  base_slug TEXT;
  unique_slug TEXT;
  counter INTEGER;
BEGIN
  FOR album_record IN 
    SELECT id, title 
    FROM albums 
    WHERE slug IS NULL
    ORDER BY title
  LOOP
    -- Generate base slug from title
    base_slug := lower(trim(album_record.title));
    -- Remove special characters
    base_slug := regexp_replace(base_slug, '[^\w\s-]', '', 'g');
    -- Replace spaces/underscores with hyphens
    base_slug := regexp_replace(base_slug, '[\s_-]+', '-', 'g');
    -- Remove leading/trailing hyphens
    base_slug := trim(both '-' from base_slug);
    
    -- Ensure uniqueness by checking existing slugs
    unique_slug := base_slug;
    counter := 1;
    
    WHILE EXISTS (
      SELECT 1 FROM albums 
      WHERE slug = unique_slug AND id != album_record.id
    ) LOOP
      unique_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
    
    -- Update the album with unique slug
    UPDATE albums 
    SET slug = unique_slug 
    WHERE id = album_record.id;
    
    RAISE NOTICE 'Updated album "%" with slug "%"', album_record.title, unique_slug;
  END LOOP;
  
  RAISE NOTICE 'Completed backfilling album slugs';
END $$;