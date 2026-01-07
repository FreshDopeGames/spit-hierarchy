-- Add session_count column if missing
ALTER TABLE public.member_stats 
ADD COLUMN IF NOT EXISTS session_count INTEGER NOT NULL DEFAULT 0;

-- Update check_and_award_achievements to include session_count
CREATE OR REPLACE FUNCTION public.check_and_award_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  achievement_record RECORD;
  current_value INTEGER;
  user_id_to_check UUID;
BEGIN
  -- Determine which user to check based on the table
  IF TG_TABLE_NAME = 'member_stats' THEN
    user_id_to_check := NEW.id;
  ELSIF TG_TABLE_NAME = 'user_achievements' THEN
    user_id_to_check := NEW.user_id;
  ELSE
    RETURN NEW;
  END IF;

  -- Check all threshold-based achievements
  FOR achievement_record IN 
    SELECT * FROM achievements 
    WHERE threshold_field IS NOT NULL 
    AND is_active = true
  LOOP
    -- Get current value based on threshold field
    SELECT CASE achievement_record.threshold_field
      WHEN 'total_votes' THEN COALESCE(total_votes, 0)
      WHEN 'consecutive_voting_days' THEN COALESCE(consecutive_voting_days, 0)
      WHEN 'rappers_voted_count' THEN COALESCE(rappers_voted_count, 0)
      WHEN 'total_comments' THEN COALESCE(total_comments, 0)
      WHEN 'total_upvotes' THEN COALESCE(total_upvotes, 0)
      WHEN 'votes_with_notes_count' THEN COALESCE(votes_with_notes_count, 0)
      WHEN 'ranking_lists_created' THEN COALESCE(ranking_lists_created, 0)
      WHEN 'profile_views_count' THEN COALESCE(profile_views_count, 0)
      WHEN 'session_count' THEN COALESCE(session_count, 0)
      ELSE 0
    END INTO current_value
    FROM member_stats
    WHERE id = user_id_to_check;

    -- If threshold met and not already earned, award achievement
    IF current_value >= achievement_record.threshold_value THEN
      INSERT INTO user_achievements (user_id, achievement_id, progress_value, earned_at)
      VALUES (user_id_to_check, achievement_record.id, current_value, NOW())
      ON CONFLICT (user_id, achievement_id) 
      DO UPDATE SET progress_value = current_value
      WHERE user_achievements.earned_at IS NULL;
    ELSE
      -- Update progress for unearned achievements
      INSERT INTO user_achievements (user_id, achievement_id, progress_value)
      VALUES (user_id_to_check, achievement_record.id, current_value)
      ON CONFLICT (user_id, achievement_id) 
      DO UPDATE SET progress_value = current_value
      WHERE user_achievements.earned_at IS NULL;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Recalculate ALL user statuses based on current achievement points
UPDATE public.member_stats ms
SET 
  status = public.calculate_member_status(
    COALESCE((
      SELECT SUM(a.points)::integer
      FROM public.user_achievements ua
      JOIN public.achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = ms.id
      AND ua.earned_at IS NOT NULL
    ), 0)
  ),
  updated_at = NOW();