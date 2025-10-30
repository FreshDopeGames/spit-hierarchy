-- Fix rating calculation asynchrony by excluding "Overall" category

-- Step 1: Adjust average_rating column to allow values up to 10.00
ALTER TABLE public.rappers 
ALTER COLUMN average_rating TYPE NUMERIC(4, 2);

-- Step 2: Update the calculate_rapper_average_rating function to exclude "Overall" category
CREATE OR REPLACE FUNCTION public.calculate_rapper_average_rating(rapper_uuid uuid)
RETURNS numeric
LANGUAGE plpgsql
STABLE
AS $function$
DECLARE
  avg_rating NUMERIC;
BEGIN
  SELECT COALESCE(AVG(v.rating), 0) INTO avg_rating
  FROM votes v
  JOIN voting_categories vc ON v.category_id = vc.id
  WHERE v.rapper_id = rapper_uuid
    AND vc.name != 'Overall';  -- Exclude Overall category from calculation
  
  RETURN ROUND(avg_rating, 2);
END;
$function$;

-- Step 3: Delete all legacy votes in the "Overall" category
DELETE FROM public.votes 
WHERE category_id = (SELECT id FROM public.voting_categories WHERE name = 'Overall');

-- Step 4: Recalculate all rapper ratings with the new function
UPDATE public.rappers 
SET 
  average_rating = public.calculate_rapper_average_rating(id),
  total_votes = public.calculate_rapper_attribute_votes(id),
  updated_at = NOW();

-- Add comment for documentation
COMMENT ON FUNCTION public.calculate_rapper_average_rating IS 
'Calculates average rating for a rapper excluding the Overall category, which is derived from other skills';