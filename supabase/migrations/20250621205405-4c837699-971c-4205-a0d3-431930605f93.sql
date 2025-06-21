
-- Create a new public function for rapper voting statistics that doesn't require admin access
CREATE OR REPLACE FUNCTION public.get_public_rapper_voting_stats()
RETURNS TABLE (
  id uuid,
  name text,
  total_votes bigint,
  unique_voters bigint,
  average_rating numeric,
  votes_last_7_days bigint,
  votes_last_30_days bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  -- This function provides public access to rapper voting analytics
  SELECT 
    r.id,
    r.name,
    COUNT(v.id)::bigint as total_votes,
    COUNT(DISTINCT v.user_id)::bigint as unique_voters,
    AVG(v.rating) as average_rating,
    COUNT(CASE WHEN v.created_at >= NOW() - INTERVAL '7 days' THEN 1 END)::bigint as votes_last_7_days,
    COUNT(CASE WHEN v.created_at >= NOW() - INTERVAL '30 days' THEN 1 END)::bigint as votes_last_30_days
  FROM public.rappers r
  LEFT JOIN public.votes v ON r.id = v.rapper_id
  GROUP BY r.id, r.name
  HAVING COUNT(v.id) > 0  -- Only include rappers with votes
  ORDER BY total_votes DESC, average_rating DESC;
$function$;
