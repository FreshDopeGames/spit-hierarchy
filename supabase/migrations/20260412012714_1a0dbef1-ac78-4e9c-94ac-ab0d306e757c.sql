
-- Create voter_locations table
CREATE TABLE public.voter_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  country text,
  country_code text,
  region text,
  city text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_voter_locations_country_code ON public.voter_locations(country_code);
CREATE INDEX idx_voter_locations_region ON public.voter_locations(region);
CREATE INDEX idx_voter_locations_user_id ON public.voter_locations(user_id);

ALTER TABLE public.voter_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all voter locations"
ON public.voter_locations FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can insert their own location"
ON public.voter_locations FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own location"
ON public.voter_locations FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Service role needs full access for the edge function
CREATE POLICY "Service role full access"
ON public.voter_locations FOR ALL
USING (true)
WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_voter_locations_updated_at
BEFORE UPDATE ON public.voter_locations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.voter_locations;

----------------------------------------------------------------------
-- RPC: get_global_voting_stats (replaces broken client-side aggregation)
----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_global_voting_stats(
  p_country_code text DEFAULT NULL,
  p_region text DEFAULT NULL
)
RETURNS TABLE(total_votes bigint, active_voters bigint, rated_rappers bigint, avg_rating numeric)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT
    COUNT(v.id)::bigint AS total_votes,
    COUNT(DISTINCT v.user_id)::bigint AS active_voters,
    COUNT(DISTINCT v.rapper_id)::bigint AS rated_rappers,
    COALESCE(AVG(v.rating), 0) AS avg_rating
  FROM public.votes v
  LEFT JOIN public.voter_locations vl ON v.user_id = vl.user_id
  WHERE
    (p_country_code IS NULL OR vl.country_code = p_country_code)
    AND (p_region IS NULL OR vl.region = p_region);
$function$;

----------------------------------------------------------------------
-- RPC: get_most_rated_rappers (replaces broken client-side aggregation)
----------------------------------------------------------------------
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
    AND (p_country_code IS NULL OR vl.country_code = p_country_code)
    AND (p_region IS NULL OR vl.region = p_region)
  GROUP BY r.id, r.name, r.slug
  ORDER BY rating_count DESC
  LIMIT p_limit;
$function$;

----------------------------------------------------------------------
-- Update get_public_rapper_voting_stats with geo filters
----------------------------------------------------------------------
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
  WHERE (p_country_code IS NULL OR vl.country_code = p_country_code)
    AND (p_region IS NULL OR vl.region = p_region)
  GROUP BY r.id, r.name
  HAVING COUNT(v.id) > 0
  ORDER BY total_votes DESC, average_rating DESC;
$function$;

----------------------------------------------------------------------
-- Update get_category_voting_analytics with geo filters (remove admin-only)
----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_category_voting_analytics(
  p_country_code text DEFAULT NULL,
  p_region text DEFAULT NULL
)
RETURNS TABLE(id uuid, name text, description text, total_votes bigint, unique_voters bigint, unique_rappers bigint, average_rating numeric)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT 
    vc.id,
    vc.name,
    vc.description,
    COUNT(v.id)::bigint as total_votes,
    COUNT(DISTINCT v.user_id)::bigint as unique_voters,
    COUNT(DISTINCT v.rapper_id)::bigint as unique_rappers,
    AVG(v.rating) as average_rating
  FROM public.voting_categories vc
  LEFT JOIN public.votes v ON vc.id = v.category_id
  LEFT JOIN public.voter_locations vl ON v.user_id = vl.user_id
  WHERE (p_country_code IS NULL OR vl.country_code = p_country_code)
    AND (p_region IS NULL OR vl.region = p_region)
  GROUP BY vc.id, vc.name, vc.description;
$function$;
