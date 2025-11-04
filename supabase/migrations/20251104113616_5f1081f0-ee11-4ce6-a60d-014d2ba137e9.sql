-- Create trigger function to ensure album slugs are generated automatically
CREATE OR REPLACE FUNCTION public.ensure_album_slug_trigger_fn()
RETURNS TRIGGER AS $$
BEGIN
  -- If slug is NULL or empty, generate it automatically
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_album_slug(NEW.title, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to albums table (fires before insert or update)
DROP TRIGGER IF EXISTS albums_ensure_slug_trigger ON public.albums;
CREATE TRIGGER albums_ensure_slug_trigger
  BEFORE INSERT OR UPDATE ON public.albums
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_album_slug_trigger_fn();

-- Backfill any missing slugs (safety net for existing data)
UPDATE public.albums 
SET slug = public.generate_album_slug(title, id)
WHERE slug IS NULL OR slug = '';

-- Make slug column NOT NULL to enforce at database level
ALTER TABLE public.albums 
ALTER COLUMN slug SET NOT NULL;

-- Add unique index on slug to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS albums_slug_unique_idx 
ON public.albums(slug);