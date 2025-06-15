
-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_user_rankings_user_id ON user_rankings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rankings_public_created ON user_rankings(is_public, created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_user_ranking_items_ranking_id ON user_ranking_items(ranking_id);
CREATE INDEX IF NOT EXISTS idx_user_ranking_items_position ON user_ranking_items(ranking_id, position) WHERE position <= 5;
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_ranking_tag_assignments_ranking ON user_ranking_tag_assignments(ranking_id);

-- Add foreign key constraint between user_rankings and profiles
ALTER TABLE user_rankings 
ADD CONSTRAINT fk_user_rankings_profiles 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Optimize the user ranking items query with a function for top items only
CREATE OR REPLACE FUNCTION get_user_ranking_preview_items(ranking_uuid uuid, item_limit integer DEFAULT 5)
RETURNS TABLE (
  item_position integer,
  item_reason text,
  rapper_name text
) 
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uri.position as item_position,
    uri.reason as item_reason,
    r.name as rapper_name
  FROM user_ranking_items uri
  JOIN rappers r ON uri.rapper_id = r.id
  WHERE uri.ranking_id = ranking_uuid 
    AND uri.position <= item_limit
  ORDER BY uri.position ASC;
END;
$$;
