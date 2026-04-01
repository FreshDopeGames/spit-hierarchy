-- Fix the trigger function to only count earned achievements
CREATE OR REPLACE FUNCTION public.update_member_status_on_achievement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_points INTEGER;
  new_status public.member_status;
  old_status public.member_status;
BEGIN
  -- Calculate total achievement points for the user (ONLY earned achievements)
  SELECT COALESCE(SUM(a.points), 0)::INTEGER INTO total_points
  FROM public.user_achievements ua
  JOIN public.achievements a ON ua.achievement_id = a.id
  WHERE ua.user_id = NEW.user_id
    AND ua.earned_at IS NOT NULL;
  
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

-- Recalculate status for ALL users based on only earned achievements
UPDATE public.member_stats ms
SET status = public.calculate_member_status(
  COALESCE((
    SELECT SUM(a.points)::INTEGER
    FROM public.user_achievements ua
    JOIN public.achievements a ON ua.achievement_id = a.id
    WHERE ua.user_id = ms.id
      AND ua.earned_at IS NOT NULL
  ), 0)
),
updated_at = NOW();