-- Ensure we refresh aggregates and reorder positions when user ranking votes change
DROP TRIGGER IF EXISTS refresh_user_ranking_vote_counts_trigger ON public.user_ranking_votes;
CREATE TRIGGER refresh_user_ranking_vote_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_ranking_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.refresh_user_ranking_vote_counts();