-- Fix incorrect column reference in get_user_ranking_preview_items
-- The user_ranking_votes table uses 'user_ranking_id', not 'ranking_id'
DROP FUNCTION IF EXISTS get_user_ranking_preview_items(UUID, INTEGER);

CREATE OR REPLACE FUNCTION get_user_ranking_preview_items(
  ranking_uuid UUID,
  item_limit INTEGER DEFAULT 5
)
RETURNS TABLE(
  id UUID,
  item_position INTEGER,
  reason TEXT,
  is_ranked BOOLEAN,
  rapper_id UUID,
  rapper_name TEXT,
  rapper_image_url TEXT,
  rapper_slug TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uri.id,
    uri."position" as item_position,
    uri.reason,
    uri.is_ranked,
    r.id as rapper_id,
    r.name as rapper_name,
    r.image_url as rapper_image_url,
    r.slug as rapper_slug
  FROM user_ranking_items uri
  JOIN rappers r ON uri.rapper_id = r.id
  LEFT JOIN (
    -- Get vote counts per rapper for this ranking
    SELECT 
      user_ranking_votes.rapper_id,
      COALESCE(SUM(user_ranking_votes.vote_weight), 0) as total_votes
    FROM user_ranking_votes
    WHERE user_ranking_votes.user_ranking_id = ranking_uuid
    GROUP BY user_ranking_votes.rapper_id
  ) votes ON uri.rapper_id = votes.rapper_id
  WHERE uri.ranking_id = ranking_uuid
  ORDER BY 
    CASE WHEN uri.is_ranked THEN 0 ELSE 1 END, -- Ranked items first
    COALESCE(votes.total_votes, 0) DESC,       -- Then by vote count (highest first)
    uri."position" ASC                          -- Then by position (tie-breaker)
  LIMIT item_limit;
END;
$$;