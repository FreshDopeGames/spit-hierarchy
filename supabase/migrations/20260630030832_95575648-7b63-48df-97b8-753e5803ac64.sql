
DROP POLICY IF EXISTS "Users can view their own consent logs" ON public.consent_logs;

DROP POLICY IF EXISTS "Users can view their own votes" ON public.poll_votes;
CREATE POLICY "Users can view their own poll votes"
ON public.poll_votes FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can view all voter locations" ON public.voter_locations;
CREATE POLICY "Users view own voter location"
ON public.voter_locations FOR SELECT TO authenticated
USING (auth.uid() = user_id);
CREATE POLICY "Admins view all voter locations"
ON public.voter_locations FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.get_voter_activity_map()
RETURNS TABLE(country text, country_code text, region text, voter_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT country, country_code, region, COUNT(*)::bigint
  FROM public.voter_locations
  GROUP BY country, country_code, region;
$$;
REVOKE ALL ON FUNCTION public.get_voter_activity_map() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_voter_activity_map() TO anon, authenticated;

DROP POLICY IF EXISTS "Users can view all member stats" ON public.member_stats;
CREATE POLICY "Users view own member stats"
ON public.member_stats FOR SELECT TO authenticated
USING (auth.uid() = id);
CREATE POLICY "Admins view all member stats"
ON public.member_stats FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.get_public_member_stats(_user_ids uuid[] DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  status text,
  total_upvotes integer,
  total_comments integer,
  total_votes integer,
  ranking_lists_created integer,
  consecutive_voting_days integer,
  top_five_created integer,
  rappers_voted_count integer,
  votes_with_notes_count integer,
  badges jsonb
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id, status, total_upvotes, total_comments, total_votes,
         ranking_lists_created, consecutive_voting_days, top_five_created,
         rappers_voted_count, votes_with_notes_count, badges
  FROM public.member_stats
  WHERE _user_ids IS NULL OR id = ANY(_user_ids);
$$;
REVOKE ALL ON FUNCTION public.get_public_member_stats(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_member_stats(uuid[]) TO anon, authenticated;

REVOKE SELECT (user_id) ON public.ranking_votes FROM anon;
REVOKE SELECT (user_id) ON public.vs_match_votes FROM anon;
REVOKE SELECT (user_id) ON public.album_votes FROM anon;
REVOKE SELECT (user_id) ON public.votes FROM anon;
REVOKE SELECT (user_id) ON public.poll_votes FROM anon;

DROP POLICY IF EXISTS "Users view own votes only" ON public.votes;
DROP POLICY IF EXISTS "Users view own ranking votes only" ON public.ranking_votes;

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure::text AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public'
      AND p.prosecdef = true
      AND p.proname IN (
        'is_admin','is_moderator_or_admin','can_manage_blog_content',
        'has_role','check_rate_limit','is_verified_artist',
        'is_verified_for_rapper','get_verified_rapper_id'
      )
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon', r.sig);
  END LOOP;
END $$;
