-- Phase 1: Create function to update career_start_year from discography (FIXED)
CREATE OR REPLACE FUNCTION public.update_career_start_from_discography()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  updated_count INTEGER := 0;
BEGIN
  -- Update career_start_year from earliest album/mixtape release
  UPDATE public.rappers r
  SET 
    career_start_year = earliest.first_release_year,
    updated_at = NOW()
  FROM (
    SELECT 
      ra.rapper_id,
      EXTRACT(YEAR FROM MIN(a.release_date))::INTEGER as first_release_year
    FROM public.rapper_albums ra
    JOIN public.albums a ON ra.album_id = a.id
    WHERE a.release_date IS NOT NULL
    GROUP BY ra.rapper_id
  ) earliest
  WHERE r.id = earliest.rapper_id
    AND (r.career_start_year IS NULL OR r.career_start_year <> earliest.first_release_year);
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RAISE NOTICE 'Updated career_start_year for % rappers from discography', updated_count;
  
  RETURN updated_count;
END;
$function$;

-- Execute the function to fix existing data
SELECT public.update_career_start_from_discography();