-- Fix Achievement Awarding Logic
-- Remove NOT NULL and DEFAULT constraints from earned_at
ALTER TABLE public.user_achievements 
  ALTER COLUMN earned_at DROP NOT NULL,
  ALTER COLUMN earned_at DROP DEFAULT;

-- Reset incorrectly awarded achievements (where progress < threshold)
UPDATE public.user_achievements ua
SET earned_at = NULL
FROM public.achievements a
WHERE ua.achievement_id = a.id
  AND ua.progress_value < a.threshold_value
  AND ua.earned_at IS NOT NULL;

-- Update check_and_award_achievements function to explicitly set earned_at = NULL for progress tracking
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  achievement_record RECORD;
  current_value INTEGER;
  existing_progress INTEGER;
BEGIN
  -- Loop through all active achievements
  FOR achievement_record IN 
    SELECT * FROM public.achievements 
    WHERE is_active = true
  LOOP
    -- Calculate current progress based on achievement type and threshold field
    current_value := 0;
    
    -- Get the current value from member_stats based on threshold_field
    IF achievement_record.threshold_field IS NOT NULL THEN
      EXECUTE format('SELECT COALESCE(%I, 0) FROM public.member_stats WHERE id = $1', 
                     achievement_record.threshold_field)
      INTO current_value
      USING target_user_id;
    END IF;
    
    -- Check if user already has this achievement record
    SELECT progress_value INTO existing_progress
    FROM public.user_achievements
    WHERE user_id = target_user_id 
      AND achievement_id = achievement_record.id;
    
    IF existing_progress IS NULL THEN
      -- Create new achievement progress record with earned_at = NULL
      IF current_value >= achievement_record.threshold_value THEN
        -- Achievement earned immediately
        INSERT INTO public.user_achievements (user_id, achievement_id, earned_at, progress_value)
        VALUES (target_user_id, achievement_record.id, NOW(), current_value);
      ELSE
        -- Track progress, explicitly set earned_at = NULL
        INSERT INTO public.user_achievements (user_id, achievement_id, earned_at, progress_value)
        VALUES (target_user_id, achievement_record.id, NULL, current_value);
      END IF;
    ELSE
      -- Update existing progress
      IF current_value >= achievement_record.threshold_value THEN
        -- Mark as earned if not already
        UPDATE public.user_achievements
        SET progress_value = current_value,
            earned_at = COALESCE(earned_at, NOW())
        WHERE user_id = target_user_id 
          AND achievement_id = achievement_record.id;
      ELSE
        -- Update progress only, keep earned_at NULL
        UPDATE public.user_achievements
        SET progress_value = current_value,
            earned_at = NULL
        WHERE user_id = target_user_id 
          AND achievement_id = achievement_record.id;
      END IF;
    END IF;
  END LOOP;
END;
$$;