-- =====================================================================
-- Fix: draft rappers leaking onto the public site, and solo artists
-- (e.g. AZ Chike, Dobby) appearing in filtered rankings like Best Groups.
--
-- Root causes:
--   1. add_rapper_to_all_rankings() inserted every newly published rapper
--      into EVERY official ranking, ignoring each ranking's filter_criteria.
--   2. populate_ranking_with_rappers() / clean_official_ranking_items()
--      never checked publish_status, so drafts could be (re)added.
--   3. Nothing re-evaluated membership when a rapper's group tag, origin,
--      albums or publish status changed later.
--   4. Several SECURITY DEFINER RPCs bypass RLS and returned drafts.
-- =====================================================================

-- 1. Single source of truth: does this rapper belong in a ranking?
CREATE OR REPLACE FUNCTION public.rapper_matches_ranking_filter(p_rapper_id uuid, p_filter jsonb)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  f jsonb := COALESCE(p_filter, '{}'::jsonb);
  decades_array text[] := ARRAY(SELECT jsonb_array_elements_text(COALESCE(f->'decades', '[]'::jsonb)));
  locations_array text[] := ARRAY(SELECT jsonb_array_elements_text(COALESCE(f->'locations', '[]'::jsonb)));
  artist_types_array text[] := ARRAY(SELECT jsonb_array_elements_text(COALESCE(f->'artist_types', '[]'::jsonb)));
  tag_ids_array uuid[] := ARRAY(SELECT (jsonb_array_elements_text(COALESCE(f->'tag_ids', '[]'::jsonb)))::uuid);
  r RECORD;
  is_group boolean;
  first_year int;
BEGIN
  SELECT id, origin, publish_status INTO r FROM public.rappers WHERE id = p_rapper_id;
  IF NOT FOUND OR r.publish_status IS DISTINCT FROM 'published' THEN
    RETURN false;
  END IF;

  -- Artist type (group = has the 'group' tag)
  IF array_length(artist_types_array, 1) IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM public.rapper_tag_assignments rta
      JOIN public.rapper_tags t ON t.id = rta.tag_id
      WHERE rta.rapper_id = p_rapper_id AND t.slug = 'group'
    ) INTO is_group;

    IF NOT (('group' = ANY(artist_types_array) AND is_group)
         OR ('solo'  = ANY(artist_types_array) AND NOT is_group)) THEN
      RETURN false;
    END IF;
  END IF;

  -- Location
  IF array_length(locations_array, 1) IS NOT NULL
     AND (r.origin IS NULL OR NOT (r.origin = ANY(locations_array))) THEN
    RETURN false;
  END IF;

  -- Tags (any match)
  IF array_length(tag_ids_array, 1) IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.rapper_tag_assignments rta
    WHERE rta.rapper_id = p_rapper_id AND rta.tag_id = ANY(tag_ids_array)
  ) THEN
    RETURN false;
  END IF;

  -- Decade of first album release
  IF array_length(decades_array, 1) IS NOT NULL THEN
    SELECT MIN(EXTRACT(YEAR FROM a.release_date)::int) INTO first_year
    FROM public.rapper_albums ra
    JOIN public.albums a ON a.id = ra.album_id
    WHERE ra.rapper_id = p_rapper_id AND a.release_date IS NOT NULL;

    IF first_year IS NULL OR NOT EXISTS (
      SELECT 1 FROM unnest(decades_array) d
      WHERE first_year BETWEEN SUBSTRING(d, 1, 4)::int AND SUBSTRING(d, 1, 4)::int + 9
    ) THEN
      RETURN false;
    END IF;
  END IF;

  RETURN true;
END;
$function$;

-- 2. Add/remove one rapper across all official rankings (and drop from user
--    rankings when no longer published).
CREATE OR REPLACE FUNCTION public.sync_rapper_official_rankings(p_rapper_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  rk RECORD;
  should_be_in boolean;
  is_in boolean;
  changed boolean;
  is_published boolean;
BEGIN
  SELECT publish_status = 'published' INTO is_published FROM public.rappers WHERE id = p_rapper_id;
  is_published := COALESCE(is_published, false);

  FOR rk IN SELECT id, filter_criteria FROM public.official_rankings LOOP
    should_be_in := is_published AND public.rapper_matches_ranking_filter(p_rapper_id, rk.filter_criteria);
    is_in := EXISTS (SELECT 1 FROM public.ranking_items WHERE ranking_id = rk.id AND rapper_id = p_rapper_id);
    changed := false;

    IF should_be_in AND NOT is_in THEN
      INSERT INTO public.ranking_items (ranking_id, rapper_id, position, is_ranked)
      SELECT rk.id, p_rapper_id, COALESCE(MAX(position), 0) + 1, FALSE
      FROM public.ranking_items WHERE ranking_id = rk.id;
      changed := true;
    ELSIF NOT should_be_in AND is_in THEN
      DELETE FROM public.ranking_items WHERE ranking_id = rk.id AND rapper_id = p_rapper_id;
      changed := true;
    END IF;

    IF changed THEN
      PERFORM public.resort_ranking_unranked_alphabetically(rk.id);
    END IF;
  END LOOP;

  IF NOT is_published THEN
    DELETE FROM public.user_ranking_items WHERE rapper_id = p_rapper_id;
  END IF;
END;
$function$;

-- 3. Official-rankings trigger on rappers now respects filters
CREATE OR REPLACE FUNCTION public.add_rapper_to_all_rankings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public.sync_rapper_official_rankings(NEW.id);
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS add_new_rapper_to_rankings ON public.rappers;
CREATE TRIGGER add_new_rapper_to_rankings
  AFTER INSERT OR UPDATE OF publish_status, origin ON public.rappers
  FOR EACH ROW EXECUTE FUNCTION public.add_rapper_to_all_rankings();

-- 4. Re-sync when tags change (this is what decides group vs solo)
CREATE OR REPLACE FUNCTION public.trg_sync_rapper_rankings_from_child()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    PERFORM public.sync_rapper_official_rankings(OLD.rapper_id);
  END IF;
  IF TG_OP IN ('INSERT', 'UPDATE')
     AND (TG_OP = 'INSERT' OR NEW.rapper_id IS DISTINCT FROM OLD.rapper_id) THEN
    PERFORM public.sync_rapper_official_rankings(NEW.rapper_id);
  END IF;
  RETURN NULL;
END;
$function$;

DROP TRIGGER IF EXISTS sync_rankings_on_tag_change ON public.rapper_tag_assignments;
CREATE TRIGGER sync_rankings_on_tag_change
  AFTER INSERT OR UPDATE OR DELETE ON public.rapper_tag_assignments
  FOR EACH ROW EXECUTE FUNCTION public.trg_sync_rapper_rankings_from_child();

DROP TRIGGER IF EXISTS sync_rankings_on_album_change ON public.rapper_albums;
CREATE TRIGGER sync_rankings_on_album_change
  AFTER INSERT OR UPDATE OR DELETE ON public.rapper_albums
  FOR EACH ROW EXECUTE FUNCTION public.trg_sync_rapper_rankings_from_child();

-- 5. User-rankings trigger: keep adding on publish, remove on unpublish
CREATE OR REPLACE FUNCTION public.add_rapper_to_all_user_rankings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  ranking_record RECORD;
  max_position INTEGER;
BEGIN
  IF NEW.publish_status IS DISTINCT FROM 'published' THEN
    DELETE FROM public.user_ranking_items WHERE rapper_id = NEW.id;
    RETURN NEW;
  END IF;

  FOR ranking_record IN SELECT id FROM public.user_rankings LOOP
    SELECT COALESCE(MAX(position), 0) + 1 INTO max_position
    FROM public.user_ranking_items WHERE ranking_id = ranking_record.id;

    INSERT INTO public.user_ranking_items (ranking_id, rapper_id, position, is_ranked)
    VALUES (ranking_record.id, NEW.id, max_position, FALSE)
    ON CONFLICT (ranking_id, rapper_id) DO NOTHING;

    PERFORM public.resort_user_ranking_unranked_alphabetically(ranking_record.id);
  END LOOP;

  RETURN NEW;
END;
$function$;

-- 6. Admin populate / clean RPCs use the same rule (and skip drafts)
CREATE OR REPLACE FUNCTION public.populate_ranking_with_rappers(ranking_uuid uuid, filter_criteria jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  rapper_record RECORD;
  current_position INTEGER := 1;
BEGIN
  DELETE FROM public.ranking_items WHERE ranking_id = ranking_uuid;

  FOR rapper_record IN
    SELECT r.id FROM public.rappers r
    WHERE r.publish_status = 'published'
      AND public.rapper_matches_ranking_filter(r.id, filter_criteria)
    ORDER BY r.name
  LOOP
    INSERT INTO public.ranking_items (ranking_id, rapper_id, position, is_ranked)
    VALUES (ranking_uuid, rapper_record.id, current_position, FALSE);
    current_position := current_position + 1;
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.clean_official_ranking_items(ranking_uuid uuid, filter_criteria jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH to_delete AS (
    DELETE FROM public.ranking_items ri
    WHERE ri.ranking_id = ranking_uuid
      AND NOT public.rapper_matches_ranking_filter(ri.rapper_id, filter_criteria)
    RETURNING 1
  )
  SELECT COUNT(*)::int INTO deleted_count FROM to_delete;
  RETURN deleted_count;
END;
$function$;

-- 7. One-time cleanup of existing data
--    Remove drafts and non-matching rappers (e.g. solo artists in Best Groups),
--    add any matching published rappers that are missing, then re-sort.
--    Votes live in ranking_votes and are not touched.
DELETE FROM public.user_ranking_items uri
USING public.rappers r
WHERE uri.rapper_id = r.id AND r.publish_status IS DISTINCT FROM 'published';

DO $$
DECLARE
  rk RECORD;
BEGIN
  FOR rk IN SELECT id, filter_criteria FROM public.official_rankings LOOP
    DELETE FROM public.ranking_items ri
    WHERE ri.ranking_id = rk.id
      AND NOT public.rapper_matches_ranking_filter(ri.rapper_id, rk.filter_criteria);

    INSERT INTO public.ranking_items (ranking_id, rapper_id, position, is_ranked)
    SELECT rk.id, r.id,
           (SELECT COALESCE(MAX(position), 0) FROM public.ranking_items WHERE ranking_id = rk.id)
             + ROW_NUMBER() OVER (ORDER BY r.name),
           FALSE
    FROM public.rappers r
    WHERE r.publish_status = 'published'
      AND public.rapper_matches_ranking_filter(r.id, rk.filter_criteria)
      AND NOT EXISTS (SELECT 1 FROM public.ranking_items ri WHERE ri.ranking_id = rk.id AND ri.rapper_id = r.id);

    PERFORM public.resort_ranking_unranked_alphabetically(rk.id);
  END LOOP;
END $$;

-- 8. SECURITY DEFINER RPCs that bypass RLS: exclude drafts for everyone
-- get_rated_rappers: exclude drafts
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
    AND r.publish_status = 'published'
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

-- get_unrated_rappers: exclude drafts
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
    AND r.publish_status = 'published'
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

-- search_rappers: exclude drafts
CREATE OR REPLACE FUNCTION public.search_rappers(
  search_term text,
  exclude_ids uuid[] DEFAULT ARRAY[]::uuid[],
  max_results integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  name text,
  real_name text,
  slug text,
  aliases text[],
  image_url text,
  match_source text,
  score int
)
LANGUAGE sql
STABLE
AS $$
  WITH t AS (
    SELECT
      r.id,
      r.name,
      r.real_name,
      r.slug,
      r.aliases,
      r.image_url,
      EXISTS (
        SELECT 1 FROM unnest(COALESCE(r.aliases, ARRAY[]::text[])) a
        WHERE unaccent(lower(a)) = unaccent(lower(search_term))
      ) AS alias_exact,
      EXISTS (
        SELECT 1 FROM unnest(COALESCE(r.aliases, ARRAY[]::text[])) a
        WHERE unaccent(lower(a)) LIKE '%' || unaccent(lower(search_term)) || '%'
      ) AS alias_partial,
      unaccent(lower(r.name)) AS n_name,
      unaccent(lower(COALESCE(r.real_name, ''))) AS n_real_name,
      unaccent(lower(search_term)) AS n_term
    FROM public.rappers r
    WHERE NOT (r.id = ANY(COALESCE(exclude_ids, ARRAY[]::uuid[])))
      AND r.publish_status = 'published'
  ),
  m AS (
    SELECT
      id, name, real_name, slug, aliases, image_url,
      CASE
        WHEN n_name = n_term THEN 'name_exact'
        WHEN n_name LIKE n_term || '%' THEN 'name_prefix'
        WHEN n_real_name = n_term THEN 'real_name_exact'
        WHEN n_real_name LIKE n_term || '%' THEN 'real_name_prefix'
        WHEN alias_exact THEN 'alias_exact'
        WHEN n_name LIKE '%' || n_term || '%' THEN 'name_contains'
        WHEN n_real_name LIKE '%' || n_term || '%' THEN 'real_name_contains'
        WHEN alias_partial THEN 'alias_partial'
        ELSE NULL
      END AS match_source,
      CASE
        WHEN n_name = n_term THEN 100
        WHEN n_name LIKE n_term || '%' THEN 90
        WHEN n_real_name = n_term THEN 85
        WHEN n_real_name LIKE n_term || '%' THEN 80
        WHEN alias_exact THEN 75
        WHEN n_name LIKE '%' || n_term || '%' THEN 70
        WHEN n_real_name LIKE '%' || n_term || '%' THEN 65
        WHEN alias_partial THEN 60
        ELSE 0
      END AS score
    FROM t
  )
  SELECT id, name, real_name, slug, aliases, image_url, match_source, score
  FROM m
  WHERE score > 0
  ORDER BY score DESC, name ASC
  LIMIT LEAST(GREATEST(max_results, 1), 100);
$$;

-- get_trending_rappers: exclude drafts
CREATE OR REPLACE FUNCTION public.get_trending_rappers(days_back integer DEFAULT 7)
RETURNS TABLE(
  rapper_id uuid,
  rapper_name text,
  recent_votes bigint,
  recent_average_rating numeric,
  total_votes bigint,
  momentum_score numeric
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    r.id as rapper_id,
    r.name as rapper_name,
    COUNT(CASE WHEN v.created_at >= NOW() - (days_back || ' days')::INTERVAL THEN 1 END)::bigint as recent_votes,
    ROUND(AVG(CASE WHEN v.created_at >= NOW() - (days_back || ' days')::INTERVAL THEN v.rating END), 2) as recent_average_rating,
    COUNT(v.id)::bigint as total_votes,
    -- Momentum score: recent votes weighted by recency and rating
    ROUND(
      (COUNT(CASE WHEN v.created_at >= NOW() - (days_back || ' days')::INTERVAL THEN 1 END)::numeric * 
       COALESCE(AVG(CASE WHEN v.created_at >= NOW() - (days_back || ' days')::INTERVAL THEN v.rating END), 0)) / 
      NULLIF(days_back, 0), 2
    ) as momentum_score
  FROM public.rappers r
  LEFT JOIN public.votes v ON r.id = v.rapper_id
  WHERE r.publish_status = 'published'
  GROUP BY r.id, r.name
  HAVING COUNT(CASE WHEN v.created_at >= NOW() - (days_back || ' days')::INTERVAL THEN 1 END) > 0
  ORDER BY momentum_score DESC, recent_votes DESC;
$$;

-- get_most_rated_rappers: exclude drafts
CREATE OR REPLACE FUNCTION public.get_most_rated_rappers(
  p_country_code text DEFAULT NULL,
  p_region text DEFAULT NULL,
  p_limit integer DEFAULT 5
)
RETURNS TABLE(id uuid, name text, slug text, rating_count bigint, average_rating numeric)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT
    r.id,
    r.name,
    r.slug,
    COUNT(v.id)::bigint AS rating_count,
    ROUND(AVG(v.rating), 1) AS average_rating
  FROM public.votes v
  JOIN public.rappers r ON r.id = v.rapper_id
  LEFT JOIN public.voter_locations vl ON v.user_id = vl.user_id
  WHERE v.rating IS NOT NULL AND v.rating > 0
    AND r.publish_status = 'published'
    AND (p_country_code IS NULL OR vl.country_code = p_country_code)
    AND (p_region IS NULL OR vl.region = p_region)
  GROUP BY r.id, r.name, r.slug
  ORDER BY rating_count DESC
  LIMIT p_limit;
$function$;

-- get_public_rapper_voting_stats: exclude drafts
CREATE OR REPLACE FUNCTION public.get_public_rapper_voting_stats(
  p_country_code text DEFAULT NULL,
  p_region text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name text,
  total_votes bigint,
  unique_voters bigint,
  average_rating numeric,
  votes_last_7_days bigint,
  votes_last_30_days bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT 
    r.id,
    r.name,
    COUNT(v.id)::bigint as total_votes,
    COUNT(DISTINCT v.user_id)::bigint as unique_voters,
    AVG(v.rating) as average_rating,
    COUNT(CASE WHEN v.created_at >= NOW() - INTERVAL '7 days' THEN 1 END)::bigint as votes_last_7_days,
    COUNT(CASE WHEN v.created_at >= NOW() - INTERVAL '30 days' THEN 1 END)::bigint as votes_last_30_days
  FROM public.rappers r
  LEFT JOIN public.votes v ON r.id = v.rapper_id
  LEFT JOIN public.voter_locations vl ON v.user_id = vl.user_id
  WHERE r.publish_status = 'published'
    AND (p_country_code IS NULL OR vl.country_code = p_country_code)
    AND (p_region IS NULL OR vl.region = p_region)
  GROUP BY r.id, r.name
  HAVING COUNT(v.id) > 0
  ORDER BY total_votes DESC, average_rating DESC;
$function$;

-- get_category_rapper_ratings: exclude drafts
CREATE OR REPLACE FUNCTION public.get_category_rapper_ratings(p_category_id uuid)
RETURNS TABLE(rapper_id uuid, rapper_name text, slug text, average_rating numeric, vote_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.id, r.name, r.slug, AVG(v.rating)::numeric, COUNT(*)::bigint
  FROM public.votes v JOIN public.rappers r ON r.id = v.rapper_id
  WHERE v.category_id = p_category_id AND r.publish_status = 'published'
  GROUP BY r.id, r.name, r.slug;
$$;

-- get_public_top_five: exclude drafts
CREATE OR REPLACE FUNCTION public.get_public_top_five(p_user_id uuid)
RETURNS TABLE("position" integer, rapper_id uuid, rapper_name text, rapper_slug text, rapper_image_url text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT t.position, t.rapper_id, r.name, r.slug, r.image_url
  FROM public.user_top_rappers t JOIN public.rappers r ON r.id = t.rapper_id
  WHERE t.user_id = p_user_id AND r.publish_status = 'published' ORDER BY t.position $$;

-- get_rapper_top5_counts: exclude drafts
CREATE OR REPLACE FUNCTION public.get_rapper_top5_counts()
RETURNS TABLE (
  id uuid,
  name text,
  top5_count integer
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  -- This can be public as it's just aggregated counts
  SELECT 
    r.id,
    r.name,
    COALESCE(COUNT(utr.user_id), 0)::integer AS top5_count
  FROM public.rappers r
  LEFT JOIN public.user_top_rappers utr ON r.id = utr.rapper_id
  WHERE r.publish_status = 'published'
  GROUP BY r.id, r.name;
$function$;
