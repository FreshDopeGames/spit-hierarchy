-- Create RPC function to get top 5 ranking items sorted by actual votes
CREATE OR REPLACE FUNCTION get_official_ranking_preview_items(
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
  rapper_slug TEXT,
  ranking_votes BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ri.id,
    ri.position AS item_position,
    ri.reason,
    ri.is_ranked,
    r.id AS rapper_id,
    r.name AS rapper_name,
    r.image_url AS rapper_image_url,
    r.slug AS rapper_slug,
    COALESCE(rvc.total_vote_weight, 0) AS ranking_votes
  FROM ranking_items ri
  JOIN rappers r ON r.id = ri.rapper_id
  LEFT JOIN ranking_vote_counts rvc 
    ON rvc.rapper_id = ri.rapper_id 
    AND rvc.ranking_id = ri.ranking_id
  WHERE ri.ranking_id = ranking_uuid
  ORDER BY
    COALESCE(rvc.total_vote_weight, 0) DESC,
    ri.position ASC,
    r.name ASC
  LIMIT item_limit;
$$;