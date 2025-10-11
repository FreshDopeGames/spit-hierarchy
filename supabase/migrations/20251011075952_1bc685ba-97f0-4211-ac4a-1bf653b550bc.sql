-- Create function to get public profile stats
CREATE OR REPLACE FUNCTION public.get_public_profile_stats(profile_user_id UUID)
RETURNS TABLE(
  rappers_ranked BIGINT,
  rappers_rated BIGINT,
  bars_upvotes BIGINT,
  vs_match_votes BIGINT,
  total_achievements BIGINT
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    COUNT(DISTINCT rv.rapper_id) as rappers_ranked,
    COUNT(DISTINCT v.rapper_id) as rappers_rated,
    (SELECT COUNT(*) 
     FROM comment_likes cl
     WHERE cl.comment_id IN (
       SELECT c.id FROM comments c WHERE c.user_id = profile_user_id
     )
    ) as bars_upvotes,
    (SELECT COUNT(*) 
     FROM vs_match_votes vmv 
     WHERE vmv.user_id = profile_user_id
    ) as vs_match_votes,
    (SELECT COUNT(*) 
     FROM user_achievements ua 
     WHERE ua.user_id = profile_user_id
    ) as total_achievements
  FROM profiles p
  LEFT JOIN ranking_votes rv ON p.id = rv.user_id
  LEFT JOIN votes v ON p.id = v.user_id
  WHERE p.id = profile_user_id
  GROUP BY p.id;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_public_profile_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profile_stats(UUID) TO anon;