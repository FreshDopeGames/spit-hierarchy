-- Create RPC function to search rappers by name, real_name, and aliases
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