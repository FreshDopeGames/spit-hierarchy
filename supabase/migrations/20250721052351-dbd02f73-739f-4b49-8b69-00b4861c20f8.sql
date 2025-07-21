
-- Add slug column to rappers table
ALTER TABLE public.rappers ADD COLUMN slug text;

-- Create unique index on slug for performance and uniqueness
CREATE UNIQUE INDEX rappers_slug_unique ON public.rappers(slug);

-- Generate slugs for existing rappers
UPDATE public.rappers 
SET slug = lower(
  regexp_replace(
    regexp_replace(
      regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '^-+|-+$', '', 'g'
  )
);

-- Handle potential duplicates by appending numbers
WITH ranked_rappers AS (
  SELECT id, slug, 
         ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
  FROM public.rappers
  WHERE slug IS NOT NULL
)
UPDATE public.rappers 
SET slug = CASE 
  WHEN rr.rn = 1 THEN rr.slug
  ELSE rr.slug || '-' || rr.rn
END
FROM ranked_rappers rr
WHERE public.rappers.id = rr.id;

-- Make slug NOT NULL after generating values
ALTER TABLE public.rappers ALTER COLUMN slug SET NOT NULL;

-- Add constraint to ensure slugs are properly formatted
ALTER TABLE public.rappers ADD CONSTRAINT rappers_slug_format 
CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
