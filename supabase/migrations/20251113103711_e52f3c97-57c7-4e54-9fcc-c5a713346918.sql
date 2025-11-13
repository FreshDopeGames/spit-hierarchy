-- Create trigger function to auto-recalculate ranking positions after votes
CREATE OR REPLACE FUNCTION public.trigger_recalculate_after_vote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Recalculate positions for the ranking that received the vote
  PERFORM public.recalculate_ranking_positions(NEW.ranking_id);
  RETURN NEW;
END;
$$;

-- Attach trigger to ranking_votes table
DROP TRIGGER IF EXISTS auto_recalculate_ranking_positions ON public.ranking_votes;
CREATE TRIGGER auto_recalculate_ranking_positions
  AFTER INSERT ON public.ranking_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_recalculate_after_vote();