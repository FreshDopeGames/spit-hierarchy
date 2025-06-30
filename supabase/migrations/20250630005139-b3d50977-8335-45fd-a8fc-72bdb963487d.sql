
-- Fix the calculate_member_status function to properly reference the enum type
CREATE OR REPLACE FUNCTION public.calculate_member_status(total_points integer)
RETURNS public.member_status
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF total_points >= 1000 THEN
    RETURN 'diamond'::public.member_status;
  ELSIF total_points >= 600 THEN
    RETURN 'platinum'::public.member_status;
  ELSIF total_points >= 300 THEN
    RETURN 'gold'::public.member_status;
  ELSIF total_points >= 100 THEN
    RETURN 'silver'::public.member_status;
  ELSE
    RETURN 'bronze'::public.member_status;
  END IF;
END;
$$;

-- Fix the update_member_status_on_achievement function to properly reference the enum type
CREATE OR REPLACE FUNCTION public.update_member_status_on_achievement()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  total_points INTEGER;
  new_status public.member_status;
  old_status public.member_status;
BEGIN
  -- Calculate total achievement points for the user
  SELECT COALESCE(SUM(a.points), 0)::INTEGER INTO total_points
  FROM public.user_achievements ua
  JOIN public.achievements a ON ua.achievement_id = a.id
  WHERE ua.user_id = NEW.user_id;
  
  -- Calculate new status
  new_status := public.calculate_member_status(total_points);
  
  -- Get current status
  SELECT status INTO old_status
  FROM public.member_stats
  WHERE id = NEW.user_id;
  
  -- Update member stats with new status
  UPDATE public.member_stats
  SET 
    status = new_status,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Fix the get_vote_weight function to properly reference the enum type
CREATE OR REPLACE FUNCTION public.get_vote_weight(status public.member_status)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  CASE status
    WHEN 'diamond'::public.member_status THEN RETURN 5;
    WHEN 'platinum'::public.member_status THEN RETURN 4;
    WHEN 'gold'::public.member_status THEN RETURN 3;
    WHEN 'silver'::public.member_status THEN RETURN 2;
    WHEN 'bronze'::public.member_status THEN RETURN 1;
    ELSE RETURN 1;
  END CASE;
END;
$$;

-- Ensure all triggers that might reference member_status are properly configured
-- Drop and recreate the achievement trigger to ensure it uses the fixed function
DROP TRIGGER IF EXISTS trigger_update_member_status_on_achievement ON public.user_achievements;
CREATE TRIGGER trigger_update_member_status_on_achievement
  AFTER INSERT ON public.user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_member_status_on_achievement();

-- Also ensure the ranking vote trigger doesn't cause issues
DROP TRIGGER IF EXISTS trigger_update_member_stats_on_ranking_vote ON public.ranking_votes;
CREATE TRIGGER trigger_update_member_stats_on_ranking_vote
  AFTER INSERT ON public.ranking_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_member_stats_on_ranking_vote();
