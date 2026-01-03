-- Drop and recreate the function with the new return type
DROP FUNCTION IF EXISTS public.get_public_profile_stats(uuid);

CREATE OR REPLACE FUNCTION public.get_public_profile_stats(profile_user_id uuid)
RETURNS TABLE(
  rappers_ranked bigint,
  rappers_rated bigint,
  bars_upvotes bigint,
  quiz_questions_answered bigint,
  vs_match_votes bigint,
  total_achievements bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
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
    (SELECT COALESCE(ms.quiz_questions_answered, 0)
     FROM member_stats ms 
     WHERE ms.id = profile_user_id
    ) as quiz_questions_answered,
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