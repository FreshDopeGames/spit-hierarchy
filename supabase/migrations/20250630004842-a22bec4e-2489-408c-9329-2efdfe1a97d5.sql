
-- First, ensure the member_status enum exists and is properly accessible
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_status') THEN
        CREATE TYPE public.member_status AS ENUM ('bronze', 'silver', 'gold', 'platinum', 'diamond');
    END IF;
END$$;

-- Fix the update_rapper_attribute_stats function to not reference member_status
CREATE OR REPLACE FUNCTION public.update_rapper_attribute_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update the rapper's average rating and total votes from attribute votes only
  UPDATE public.rappers 
  SET 
    average_rating = public.calculate_rapper_average_rating(COALESCE(NEW.rapper_id, OLD.rapper_id)),
    total_votes = public.calculate_rapper_attribute_votes(COALESCE(NEW.rapper_id, OLD.rapper_id)),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.rapper_id, OLD.rapper_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Update the member stats trigger for votes table to not use member_status
CREATE OR REPLACE FUNCTION public.update_member_stats_on_vote()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update member stats for the user who cast the attribute vote
  INSERT INTO public.member_stats (id, total_votes, last_vote_date, updated_at)
  VALUES (NEW.user_id, 1, CURRENT_DATE, NOW())
  ON CONFLICT (id) 
  DO UPDATE SET 
    total_votes = public.member_stats.total_votes + 1,
    last_vote_date = CURRENT_DATE,
    updated_at = NOW(),
    -- Update consecutive voting days logic
    consecutive_voting_days = CASE 
      WHEN public.member_stats.last_vote_date = CURRENT_DATE - INTERVAL '1 day' THEN 
        public.member_stats.consecutive_voting_days + 1
      WHEN public.member_stats.last_vote_date = CURRENT_DATE THEN 
        public.member_stats.consecutive_voting_days
      ELSE 1
    END;
  
  -- Check and award achievements for this user
  PERFORM public.check_and_award_achievements(NEW.user_id);
  
  RETURN NEW;
END;
$$;

-- Ensure triggers are properly set up for the votes table (attribute voting)
DROP TRIGGER IF EXISTS trigger_update_rapper_stats_on_vote ON public.votes;
CREATE TRIGGER trigger_update_rapper_stats_on_vote
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_rapper_attribute_stats();

DROP TRIGGER IF EXISTS trigger_update_member_stats_on_vote ON public.votes;
CREATE TRIGGER trigger_update_member_stats_on_vote
  AFTER INSERT ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_member_stats_on_vote();
