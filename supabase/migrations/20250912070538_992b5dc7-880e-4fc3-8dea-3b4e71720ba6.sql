-- Update the get_user_ranking_preview_items function to only return ranked items
CREATE OR REPLACE FUNCTION public.get_user_ranking_preview_items(ranking_uuid uuid, item_limit integer DEFAULT 5)
 RETURNS TABLE(item_position integer, item_reason text, rapper_name text, rapper_id uuid, rapper_image_url text)
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    uri.position as item_position,
    uri.reason as item_reason,
    r.name as rapper_name,
    r.id as rapper_id,
    r.image_url as rapper_image_url
  FROM user_ranking_items uri
  JOIN rappers r ON uri.rapper_id = r.id
  WHERE uri.ranking_id = ranking_uuid 
    AND uri.is_ranked = true  -- Only return ranked items
    AND uri.position <= item_limit
  ORDER BY uri.position ASC;
END;
$function$