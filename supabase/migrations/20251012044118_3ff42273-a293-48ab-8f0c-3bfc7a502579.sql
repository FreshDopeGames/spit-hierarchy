-- Add index for efficient vote lookups
CREATE INDEX IF NOT EXISTS votes_user_rapper_idx ON public.votes(user_id, rapper_id);

-- Function to get rappers NOT rated by a user
CREATE OR REPLACE FUNCTION public.get_unrated_rappers(
  p_user_id uuid,
  p_search text DEFAULT NULL,
  p_origin text DEFAULT NULL,
  p_sort_by text DEFAULT 'name',
  p_sort_order text DEFAULT 'asc',
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  name text,
  real_name text,
  slug text,
  bio text,
  image_url text,
  origin text,
  birth_year integer,
  birth_month integer,
  birth_day integer,
  death_year integer,
  death_month integer,
  death_day integer,
  career_start_year integer,
  career_end_year integer,
  average_rating numeric,
  total_votes integer,
  aliases text[],
  verified boolean,
  activity_score integer,
  total_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH filtered_rappers AS (
    SELECT 
      r.*,
      COUNT(*) OVER() as total_count
    FROM public.rappers r
    WHERE NOT EXISTS (
      SELECT 1 FROM public.votes v
      WHERE v.user_id = p_user_id AND v.rapper_id = r.id
    )
    AND (p_search IS NULL OR r.name ILIKE '%' || p_search || '%' OR r.real_name ILIKE '%' || p_search || '%')
    AND (p_origin IS NULL OR r.origin ILIKE '%' || p_origin || '%')
  )
  SELECT 
    fr.id,
    fr.name,
    fr.real_name,
    fr.slug,
    fr.bio,
    fr.image_url,
    fr.origin,
    fr.birth_year,
    fr.birth_month,
    fr.birth_day,
    fr.death_year,
    fr.death_month,
    fr.death_day,
    fr.career_start_year,
    fr.career_end_year,
    fr.average_rating,
    fr.total_votes,
    fr.aliases,
    fr.verified,
    fr.activity_score,
    fr.total_count
  FROM filtered_rappers fr
  ORDER BY
    CASE WHEN p_sort_by = 'activity_score' AND p_sort_order = 'desc' THEN fr.activity_score END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'activity_score' AND p_sort_order = 'asc' THEN fr.activity_score END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'name' AND p_sort_order = 'asc' THEN fr.name END ASC,
    CASE WHEN p_sort_by = 'name' AND p_sort_order = 'desc' THEN fr.name END DESC,
    CASE WHEN p_sort_by = 'average_rating' AND p_sort_order = 'desc' THEN fr.average_rating END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'average_rating' AND p_sort_order = 'asc' THEN fr.average_rating END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'total_votes' AND p_sort_order = 'desc' THEN fr.total_votes END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'total_votes' AND p_sort_order = 'asc' THEN fr.total_votes END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'origin' AND p_sort_order = 'asc' THEN fr.origin END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'origin' AND p_sort_order = 'desc' THEN fr.origin END DESC NULLS LAST,
    fr.name ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$function$;

-- Function to get rappers rated by a user
CREATE OR REPLACE FUNCTION public.get_rated_rappers(
  p_user_id uuid,
  p_search text DEFAULT NULL,
  p_origin text DEFAULT NULL,
  p_sort_by text DEFAULT 'name',
  p_sort_order text DEFAULT 'asc',
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  name text,
  real_name text,
  slug text,
  bio text,
  image_url text,
  origin text,
  birth_year integer,
  birth_month integer,
  birth_day integer,
  death_year integer,
  death_month integer,
  death_day integer,
  career_start_year integer,
  career_end_year integer,
  average_rating numeric,
  total_votes integer,
  aliases text[],
  verified boolean,
  activity_score integer,
  total_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH filtered_rappers AS (
    SELECT 
      r.*,
      COUNT(*) OVER() as total_count
    FROM public.rappers r
    WHERE EXISTS (
      SELECT 1 FROM public.votes v
      WHERE v.user_id = p_user_id AND v.rapper_id = r.id
    )
    AND (p_search IS NULL OR r.name ILIKE '%' || p_search || '%' OR r.real_name ILIKE '%' || p_search || '%')
    AND (p_origin IS NULL OR r.origin ILIKE '%' || p_origin || '%')
  )
  SELECT 
    fr.id,
    fr.name,
    fr.real_name,
    fr.slug,
    fr.bio,
    fr.image_url,
    fr.origin,
    fr.birth_year,
    fr.birth_month,
    fr.birth_day,
    fr.death_year,
    fr.death_month,
    fr.death_day,
    fr.career_start_year,
    fr.career_end_year,
    fr.average_rating,
    fr.total_votes,
    fr.aliases,
    fr.verified,
    fr.activity_score,
    fr.total_count
  FROM filtered_rappers fr
  ORDER BY
    CASE WHEN p_sort_by = 'activity_score' AND p_sort_order = 'desc' THEN fr.activity_score END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'activity_score' AND p_sort_order = 'asc' THEN fr.activity_score END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'name' AND p_sort_order = 'asc' THEN fr.name END ASC,
    CASE WHEN p_sort_by = 'name' AND p_sort_order = 'desc' THEN fr.name END DESC,
    CASE WHEN p_sort_by = 'average_rating' AND p_sort_order = 'desc' THEN fr.average_rating END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'average_rating' AND p_sort_order = 'asc' THEN fr.average_rating END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'total_votes' AND p_sort_order = 'desc' THEN fr.total_votes END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'total_votes' AND p_sort_order = 'asc' THEN fr.total_votes END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'origin' AND p_sort_order = 'asc' THEN fr.origin END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'origin' AND p_sort_order = 'desc' THEN fr.origin END DESC NULLS LAST,
    fr.name ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$function$;