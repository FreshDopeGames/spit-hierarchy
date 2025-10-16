-- Update get_user_ranking_preview_items to sort by position only (match detail page order)
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
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    uri.id,
    uri.position AS item_position,
    uri.reason,
    uri.is_ranked,
    r.id AS rapper_id,
    r.name AS rapper_name,
    r.image_url AS rapper_image_url,
    r.slug AS rapper_slug
  FROM user_ranking_items uri
  JOIN rappers r ON r.id = uri.rapper_id
  WHERE uri.ranking_id = ranking_uuid
  ORDER BY
    CASE WHEN uri.is_ranked THEN 0 ELSE 1 END,
    uri.position ASC,
    uri.id ASC
  LIMIT item_limit;
$$;