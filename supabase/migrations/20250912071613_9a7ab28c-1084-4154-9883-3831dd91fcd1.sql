-- Fix security issues for the functions I just created by setting search_path

DROP FUNCTION IF EXISTS get_user_ranking_preview_items(UUID, INTEGER);
DROP FUNCTION IF EXISTS get_user_ranking_vote_count(UUID);
DROP FUNCTION IF EXISTS get_official_ranking_vote_count(UUID);

-- Update get_user_ranking_preview_items function with proper security
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
  WHERE uri.ranking_id = ranking_uuid
  ORDER BY 
    CASE WHEN uri.is_ranked THEN 0 ELSE 1 END, -- Ranked items first
    uri."position" ASC
  LIMIT item_limit;
END;
$$;

-- Create a function to get total vote counts for user rankings
CREATE OR REPLACE FUNCTION get_user_ranking_vote_count(ranking_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  vote_count INTEGER;
BEGIN
  -- For now, return 0 since user rankings don't have votes yet
  -- This can be updated when user ranking voting is implemented
  RETURN 0;
END;
$$;

-- Create a function to get total vote counts for official rankings
CREATE OR REPLACE FUNCTION get_official_ranking_vote_count(ranking_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  vote_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER
  INTO vote_count
  FROM ranking_votes rv
  WHERE rv.ranking_id = ranking_uuid;
  
  RETURN COALESCE(vote_count, 0);
END;
$$;