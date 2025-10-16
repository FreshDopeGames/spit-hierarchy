-- Drop existing trigger first
DROP TRIGGER IF EXISTS trigger_refresh_user_ranking_votes ON public.user_ranking_votes;

-- Drop existing function
DROP FUNCTION IF EXISTS public.refresh_user_ranking_vote_counts();

-- Recreate function with SECURITY DEFINER for elevated permissions
CREATE OR REPLACE FUNCTION public.refresh_user_ranking_vote_counts()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_ranking_vote_counts;
  RETURN NULL;
END;
$$;

-- Recreate trigger
CREATE TRIGGER trigger_refresh_user_ranking_votes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_ranking_votes
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_user_ranking_vote_counts();