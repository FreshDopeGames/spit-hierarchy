-- Add aliases column to rappers table
ALTER TABLE public.rappers 
ADD COLUMN aliases TEXT[] DEFAULT '{}';

-- Add GIN index for fast array searches
CREATE INDEX idx_rappers_aliases ON public.rappers USING GIN (aliases);

-- Add helpful comment
COMMENT ON COLUMN public.rappers.aliases IS 
'Array of alternative names/aliases the rapper is known by (e.g., ["Young Hov", "Jigga", "Hova"])';

-- Helper function for alias search matching
CREATE OR REPLACE FUNCTION public.matches_alias(aliases TEXT[], search_term TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Return true if search term matches any alias (case-insensitive, accent-insensitive)
  RETURN EXISTS (
    SELECT 1 FROM unnest(aliases) AS alias 
    WHERE unaccent(LOWER(alias)) LIKE '%' || unaccent(LOWER(search_term)) || '%'
  );
END;
$$;