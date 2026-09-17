CREATE OR REPLACE FUNCTION public.get_official_ranking_preview_items(ranking_uuid uuid, item_limit integer DEFAULT 5)
 RETURNS TABLE(id uuid, item_position integer, reason text, is_ranked boolean, rapper_id uuid, rapper_name text, rapper_image_url text, rapper_slug text, ranking_votes bigint)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    AND r.publish_status = 'published'
  ORDER BY
    COALESCE(rvc.total_vote_weight, 0) DESC,
    ri.position ASC,
    r.name ASC
  LIMIT item_limit;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_ranking_preview_items(ranking_uuid uuid, item_limit integer DEFAULT 5)
 RETURNS TABLE(id uuid, item_position integer, reason text, is_ranked boolean, rapper_id uuid, rapper_name text, rapper_image_url text, rapper_slug text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    AND r.publish_status = 'published'
  ORDER BY
    CASE WHEN uri.is_ranked THEN 0 ELSE 1 END,
    uri.position ASC,
    uri.id ASC
  LIMIT item_limit;
$function$;