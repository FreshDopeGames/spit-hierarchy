-- Create function to get top skill judges (voters who rate rappers on skill categories)
CREATE OR REPLACE FUNCTION public.get_top_skill_judges(
  days_back integer DEFAULT NULL,
  result_limit integer DEFAULT 5
)
RETURNS TABLE(
  user_id uuid,
  vote_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    v.user_id,
    COUNT(*)::bigint as vote_count
  FROM public.votes v
  JOIN public.voting_categories vc ON v.category_id = vc.id
  WHERE vc.name != 'Overall'  -- Exclude overall category, only skill-based votes
    AND (days_back IS NULL OR v.created_at >= NOW() - (days_back || ' days')::INTERVAL)
  GROUP BY v.user_id
  ORDER BY vote_count DESC
  LIMIT result_limit;
$function$;

-- Grant execute permissions to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.get_top_skill_judges(integer, integer) TO anon, authenticated;