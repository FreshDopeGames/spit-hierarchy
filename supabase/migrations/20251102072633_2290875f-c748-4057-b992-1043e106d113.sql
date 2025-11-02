-- Create or replace the achievement check function with series support
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  achievement_record RECORD;
  current_value integer;
  should_award boolean;
BEGIN
  -- For each active achievement, ordered by series and tier
  FOR achievement_record IN 
    SELECT * FROM public.achievements 
    WHERE is_active = true 
    ORDER BY series_name NULLS LAST, tier_level ASC
  LOOP
    -- Calculate current progress value based on threshold field
    SELECT CASE
      WHEN achievement_record.threshold_field = 'total_votes' THEN COALESCE(ms.total_votes, 0)
      WHEN achievement_record.threshold_field = 'consecutive_voting_days' THEN COALESCE(ms.consecutive_voting_days, 0)
      WHEN achievement_record.threshold_field = 'total_comments' THEN COALESCE(ms.total_comments, 0)
      WHEN achievement_record.threshold_field = 'ranking_lists_created' THEN COALESCE(ms.ranking_lists_created, 0)
      WHEN achievement_record.threshold_field = 'total_upvotes' THEN COALESCE(ms.total_upvotes, 0)
      WHEN achievement_record.threshold_field = 'top_five_created' THEN COALESCE(ms.top_five_created, 0)
      WHEN achievement_record.threshold_field = 'rappers_voted_count' THEN COALESCE(ms.rappers_voted_count, 0)
      WHEN achievement_record.threshold_field = 'votes_with_notes_count' THEN COALESCE(ms.votes_with_notes_count, 0)
      ELSE 0
    END INTO current_value
    FROM public.member_stats ms
    WHERE ms.id = target_user_id;
    
    -- Determine if achievement should be awarded
    should_award := current_value >= achievement_record.threshold_value;
    
    -- Award if threshold met and not already awarded
    IF should_award THEN
      INSERT INTO public.user_achievements (user_id, achievement_id, earned_at)
      VALUES (target_user_id, achievement_record.id, NOW())
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$function$;

-- Create backfill function for admin use
CREATE OR REPLACE FUNCTION public.backfill_all_user_achievements()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_record RECORD;
  processed_count integer := 0;
  awarded_count integer := 0;
  initial_achievement_count integer;
  final_achievement_count integer;
BEGIN
  -- Only admins can run this
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Get initial count
  SELECT COUNT(*) INTO initial_achievement_count FROM public.user_achievements;
  
  -- Process each user
  FOR user_record IN SELECT id FROM public.profiles
  LOOP
    PERFORM public.check_and_award_achievements(user_record.id);
    processed_count := processed_count + 1;
  END LOOP;
  
  -- Get final count
  SELECT COUNT(*) INTO final_achievement_count FROM public.user_achievements;
  awarded_count := final_achievement_count - initial_achievement_count;
  
  -- Log the operation
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    new_values
  ) VALUES (
    auth.uid(),
    'BACKFILL_ACHIEVEMENTS',
    'user_achievements',
    jsonb_build_object(
      'processed_users', processed_count,
      'achievements_awarded', awarded_count,
      'timestamp', NOW()
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'processed_users', processed_count,
    'achievements_awarded', awarded_count
  );
END;
$function$;

-- Run initial backfill for all existing users
DO $$
DECLARE
  user_record RECORD;
  processed_count integer := 0;
BEGIN
  RAISE NOTICE 'Starting achievement backfill for all users...';
  
  FOR user_record IN SELECT id FROM public.profiles
  LOOP
    PERFORM public.check_and_award_achievements(user_record.id);
    processed_count := processed_count + 1;
    
    -- Log progress every 100 users
    IF processed_count % 100 = 0 THEN
      RAISE NOTICE 'Processed % users...', processed_count;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Achievement backfill complete! Processed % users.', processed_count;
END $$;