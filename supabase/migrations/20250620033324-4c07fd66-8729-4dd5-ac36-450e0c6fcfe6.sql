
-- Create a view to get the count of how many users have each rapper in their Top 5
CREATE OR REPLACE VIEW public.rapper_top5_counts AS
SELECT 
  r.id,
  r.name,
  COALESCE(COUNT(utr.user_id), 0)::integer AS top5_count
FROM public.rappers r
LEFT JOIN public.user_top_rappers utr ON r.id = utr.rapper_id
GROUP BY r.id, r.name;

-- Add a function to get the top5 count for a specific rapper
CREATE OR REPLACE FUNCTION public.get_rapper_top5_count(rapper_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE
AS $function$
DECLARE
  count_result INTEGER;
BEGIN
  SELECT COALESCE(COUNT(user_id), 0)::INTEGER INTO count_result
  FROM public.user_top_rappers
  WHERE rapper_id = rapper_uuid;
  
  RETURN count_result;
END;
$function$;
