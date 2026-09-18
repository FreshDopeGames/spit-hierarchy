-- 1. Aggregate-only RPCs (never return user_id)

CREATE OR REPLACE FUNCTION public.get_rapper_rating_count(p_rapper_id uuid)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COUNT(DISTINCT v.user_id)::int FROM public.votes v
  WHERE v.rapper_id = p_rapper_id AND v.user_id IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.get_hot_rapper_vote_counts(p_days integer DEFAULT 7)
RETURNS TABLE(rapper_id uuid, vote_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT v.rapper_id, COUNT(*)::bigint FROM public.votes v
  WHERE v.created_at >= now() - (p_days || ' days')::interval
  GROUP BY v.rapper_id;
$$;

CREATE OR REPLACE FUNCTION public.get_category_rapper_ratings(p_category_id uuid)
RETURNS TABLE(rapper_id uuid, rapper_name text, slug text, average_rating numeric, vote_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.id, r.name, r.slug, AVG(v.rating)::numeric, COUNT(*)::bigint
  FROM public.votes v JOIN public.rappers r ON r.id = v.rapper_id
  WHERE v.category_id = p_category_id
  GROUP BY r.id, r.name, r.slug;
$$;

CREATE OR REPLACE FUNCTION public.get_rapper_category_rating_stats(p_rapper_id uuid)
RETURNS TABLE(category_id uuid, average_rating numeric, vote_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT v.category_id, AVG(v.rating)::numeric, COUNT(*)::bigint
  FROM public.votes v WHERE v.rapper_id = p_rapper_id
  GROUP BY v.category_id;
$$;

CREATE OR REPLACE FUNCTION public.get_ranking_vote_weights(p_ranking_id uuid)
RETURNS TABLE(rapper_id uuid, total_weight bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT rv.rapper_id, COALESCE(SUM(rv.vote_weight), 0)::bigint
  FROM public.ranking_votes rv WHERE rv.ranking_id = p_ranking_id
  GROUP BY rv.rapper_id;
$$;

CREATE OR REPLACE FUNCTION public.get_ranking_vote_weights_for_rappers(p_rapper_ids uuid[])
RETURNS TABLE(rapper_id uuid, total_weight bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT rv.rapper_id, COALESCE(SUM(rv.vote_weight), 0)::bigint
  FROM public.ranking_votes rv WHERE rv.rapper_id = ANY(p_rapper_ids)
  GROUP BY rv.rapper_id;
$$;

CREATE OR REPLACE FUNCTION public.get_ranking_vote_counts_by_rapper()
RETURNS TABLE(rapper_id uuid, vote_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT rv.rapper_id, COUNT(*)::bigint FROM public.ranking_votes rv
  GROUP BY rv.rapper_id;
$$;

CREATE OR REPLACE FUNCTION public.get_platform_vote_totals()
RETURNS TABLE(total_ratings bigint, total_ranking_votes bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (SELECT COUNT(*) FROM public.votes)::bigint,
         (SELECT COUNT(*) FROM public.ranking_votes)::bigint;
$$;

CREATE OR REPLACE FUNCTION public.get_most_active_ranking()
RETURNS TABLE(id uuid, title text, slug text, vote_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT o.id, o.title, o.slug, COUNT(*)::bigint AS vote_count
  FROM public.ranking_votes rv JOIN public.official_rankings o ON o.id = rv.ranking_id
  GROUP BY o.id, o.title, o.slug ORDER BY COUNT(*) DESC LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_most_voted_rapper_in_rankings()
RETURNS TABLE(id uuid, name text, slug text, image_url text, vote_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.id, r.name, r.slug, r.image_url, COUNT(*)::bigint AS vote_count
  FROM public.ranking_votes rv JOIN public.rappers r ON r.id = rv.rapper_id
  WHERE r.publish_status = 'published'
  GROUP BY r.id, r.name, r.slug, r.image_url ORDER BY COUNT(*) DESC LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_vs_match_vote_counts(p_match_id uuid)
RETURNS TABLE(rapper_choice_id uuid, vote_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT v.rapper_choice_id, COUNT(*)::bigint FROM public.vs_match_votes v
  WHERE v.vs_match_id = p_match_id GROUP BY v.rapper_choice_id;
$$;

CREATE OR REPLACE FUNCTION public.get_public_profile_by_username(p_username text)
RETURNS TABLE(id uuid, username text, avatar_url text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.username, p.avatar_url FROM public.profiles p
  WHERE p.username = p_username LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_newest_member()
RETURNS TABLE(id uuid, username text, avatar_url text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.username, p.avatar_url, p.created_at FROM public.profiles p
  WHERE p.username IS NOT NULL AND p.username NOT LIKE '%@%'
  ORDER BY p.created_at DESC LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_rapper_rating_count(uuid),
  public.get_hot_rapper_vote_counts(integer),
  public.get_category_rapper_ratings(uuid),
  public.get_rapper_category_rating_stats(uuid),
  public.get_ranking_vote_weights(uuid),
  public.get_ranking_vote_weights_for_rappers(uuid[]),
  public.get_ranking_vote_counts_by_rapper(),
  public.get_platform_vote_totals(),
  public.get_most_active_ranking(),
  public.get_most_voted_rapper_in_rankings(),
  public.get_vs_match_vote_counts(uuid),
  public.get_public_profile_by_username(text),
  public.get_newest_member()
TO anon, authenticated, service_role;

-- 2. Lock down raw vote rows

DROP POLICY IF EXISTS "Public read access for aggregate counts" ON public.votes;

DROP POLICY IF EXISTS "Public read aggregated vote counts" ON public.ranking_votes;
DROP POLICY IF EXISTS "Users view own votes and public aggregates" ON public.ranking_votes;
CREATE POLICY "Users view own ranking votes" ON public.ranking_votes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all ranking votes" ON public.ranking_votes
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public can view aggregated vote counts" ON public.user_ranking_votes;

DROP POLICY IF EXISTS "Public read for analytics aggregation" ON public.vs_match_votes;

DROP POLICY IF EXISTS "Anyone can view album votes" ON public.album_votes;
CREATE POLICY "Users view own album votes" ON public.album_votes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 3. Profiles: remove blanket authenticated read
DROP POLICY IF EXISTS "authenticated_users_view_public_usernames" ON public.profiles;