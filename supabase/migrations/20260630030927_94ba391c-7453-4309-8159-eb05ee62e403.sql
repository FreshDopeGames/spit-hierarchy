
CREATE OR REPLACE FUNCTION public.get_top_voters_weekly(_limit int DEFAULT 5)
RETURNS TABLE(user_id uuid, total_votes bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT user_id, COALESCE(SUM(vote_weight), COUNT(*))::bigint AS total_votes
  FROM public.ranking_votes
  WHERE created_at >= NOW() - INTERVAL '7 days'
  GROUP BY user_id
  ORDER BY total_votes DESC
  LIMIT _limit;
$$;
REVOKE ALL ON FUNCTION public.get_top_voters_weekly(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_top_voters_weekly(int) TO anon, authenticated;

-- Pin search_path on every existing SECURITY DEFINER function in public to fix the mutable search_path linter warnings.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid, p.oid::regprocedure::text AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
      AND NOT EXISTS (
        SELECT 1 FROM unnest(coalesce(p.proconfig, ARRAY[]::text[])) c
        WHERE c LIKE 'search_path=%'
      )
  LOOP
    BEGIN
      EXECUTE format('ALTER FUNCTION %s SET search_path = public', r.sig);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipping %: %', r.sig, SQLERRM;
    END;
  END LOOP;
END $$;
