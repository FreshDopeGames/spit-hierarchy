-- Drop and recreate functions to fix own_profile_visits column error
DROP FUNCTION IF EXISTS public.get_user_achievement_progress(uuid);

-- Fix check_and_award_achievements function to properly handle own_profile_visits
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  achievement_record RECORD;
  current_value INTEGER;
  user_achievement_record RECORD;
BEGIN
  -- Loop through all active achievements
  FOR achievement_record IN 
    SELECT * FROM public.achievements WHERE is_active = true
  LOOP
    -- Get current progress value based on threshold field
    current_value := CASE
      WHEN achievement_record.threshold_field = 'total_votes' THEN 
        (SELECT COALESCE(ms.total_votes, 0) FROM public.member_stats ms WHERE ms.id = target_user_id)
      WHEN achievement_record.threshold_field = 'consecutive_voting_days' THEN 
        (SELECT COALESCE(ms.consecutive_voting_days, 0) FROM public.member_stats ms WHERE ms.id = target_user_id)
      WHEN achievement_record.threshold_field = 'rappers_voted_count' THEN 
        (SELECT COALESCE(ms.rappers_voted_count, 0) FROM public.member_stats ms WHERE ms.id = target_user_id)
      WHEN achievement_record.threshold_field = 'ranking_lists_created' THEN 
        (SELECT COALESCE(ms.ranking_lists_created, 0) FROM public.member_stats ms WHERE ms.id = target_user_id)
      WHEN achievement_record.threshold_field = 'total_comments' THEN 
        (SELECT COALESCE(ms.total_comments, 0) FROM public.member_stats ms WHERE ms.id = target_user_id)
      WHEN achievement_record.threshold_field = 'own_profile_visits' THEN (
        SELECT COUNT(*)::int
        FROM public.profile_access_logs pal
        WHERE pal.accessor_user_id = target_user_id
          AND pal.accessed_profile_id = target_user_id
      )
      WHEN achievement_record.threshold_field = 'other_profile_visits' THEN (
        SELECT COUNT(DISTINCT pal.accessed_profile_id)::int
        FROM public.profile_access_logs pal
        WHERE pal.accessor_user_id = target_user_id
          AND pal.accessed_profile_id != target_user_id
      )
      WHEN achievement_record.threshold_field = 'profile_views_count' THEN 
        (SELECT COALESCE(ms.profile_views_count, 0) FROM public.member_stats ms WHERE ms.id = target_user_id)
      WHEN achievement_record.threshold_field = 'votes_with_notes_count' THEN 
        (SELECT COALESCE(ms.votes_with_notes_count, 0) FROM public.member_stats ms WHERE ms.id = target_user_id)
      WHEN achievement_record.threshold_field = 'about_visits' THEN 
        (SELECT COALESCE(ms.about_visits, 0) FROM public.member_stats ms WHERE ms.id = target_user_id)
      WHEN achievement_record.threshold_field = 'blog_visits' THEN 
        (SELECT COALESCE(ms.blog_visits, 0) FROM public.member_stats ms WHERE ms.id = target_user_id)
      WHEN achievement_record.threshold_field = 'cypher_visits' THEN 
        (SELECT COALESCE(ms.cypher_visits, 0) FROM public.member_stats ms WHERE ms.id = target_user_id)
      WHEN achievement_record.threshold_field = 'vs_visits' THEN 
        (SELECT COALESCE(ms.vs_visits, 0) FROM public.member_stats ms WHERE ms.id = target_user_id)
      WHEN achievement_record.threshold_field = 'analytics_visits' THEN 
        (SELECT COALESCE(ms.analytics_visits, 0) FROM public.member_stats ms WHERE ms.id = target_user_id)
      ELSE 0
    END;

    -- Check if user already has this achievement
    SELECT * INTO user_achievement_record
    FROM public.user_achievements
    WHERE user_id = target_user_id AND achievement_id = achievement_record.id;

    IF user_achievement_record.id IS NOT NULL THEN
      -- Update existing record
      IF current_value >= achievement_record.threshold_value AND user_achievement_record.earned_at IS NULL THEN
        -- Achievement just completed
        UPDATE public.user_achievements
        SET earned_at = NOW(), progress_value = current_value
        WHERE id = user_achievement_record.id;
      ELSE
        -- Just update progress
        UPDATE public.user_achievements
        SET progress_value = current_value
        WHERE id = user_achievement_record.id;
      END IF;
    ELSE
      -- Create new achievement record
      IF current_value >= achievement_record.threshold_value THEN
        -- Award immediately
        INSERT INTO public.user_achievements (user_id, achievement_id, earned_at, progress_value)
        VALUES (target_user_id, achievement_record.id, NOW(), current_value);
      ELSE
        -- Track progress
        INSERT INTO public.user_achievements (user_id, achievement_id, earned_at, progress_value)
        VALUES (target_user_id, achievement_record.id, NULL, current_value);
      END IF;
    END IF;
  END LOOP;
END;
$function$;

-- Recreate get_user_achievement_progress function with fixes
CREATE FUNCTION public.get_user_achievement_progress(target_user_id uuid)
RETURNS TABLE(
  achievement_id uuid,
  achievement_name text,
  achievement_description text,
  achievement_icon text,
  achievement_badge_color text,
  achievement_points integer,
  achievement_rarity achievement_rarity,
  achievement_type achievement_type,
  threshold_value integer,
  progress_value integer,
  earned_at timestamp with time zone,
  is_earned boolean,
  series_name text,
  tier_level integer,
  next_tier_id uuid
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_value INTEGER;
  achievement_record RECORD;
BEGIN
  -- First, ensure all achievements are tracked for this user
  FOR achievement_record IN 
    SELECT a.* FROM public.achievements a 
    WHERE a.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements ua 
      WHERE ua.user_id = target_user_id AND ua.achievement_id = a.id
    )
  LOOP
    -- Calculate current progress
    current_value := CASE
      WHEN achievement_record.threshold_field = 'total_votes' THEN 
        (SELECT COALESCE(ms.total_votes, 0) FROM public.member_stats ms WHERE ms.id = target_user_id)
      WHEN achievement_record.threshold_field = 'consecutive_voting_days' THEN 
        (SELECT COALESCE(ms.consecutive_voting_days, 0) FROM public.member_stats ms WHERE ms.id = target_user_id)
      WHEN achievement_record.threshold_field = 'rappers_voted_count' THEN 
        (SELECT COALESCE(ms.rappers_voted_count, 0) FROM public.member_stats ms WHERE ms.id = target_user_id)
      WHEN achievement_record.threshold_field = 'ranking_lists_created' THEN 
        (SELECT COALESCE(ms.ranking_lists_created, 0) FROM public.member_stats ms WHERE ms.id = target_user_id)
      WHEN achievement_record.threshold_field = 'total_comments' THEN 
        (SELECT COALESCE(ms.total_comments, 0) FROM public.member_stats ms WHERE ms.id = target_user_id)
      WHEN achievement_record.threshold_field = 'own_profile_visits' THEN (
        SELECT COUNT(*)::int
        FROM public.profile_access_logs pal
        WHERE pal.accessor_user_id = target_user_id
          AND pal.accessed_profile_id = target_user_id
      )
      WHEN achievement_record.threshold_field = 'other_profile_visits' THEN (
        SELECT COUNT(DISTINCT pal.accessed_profile_id)::int
        FROM public.profile_access_logs pal
        WHERE pal.accessor_user_id = target_user_id
          AND pal.accessed_profile_id != target_user_id
      )
      WHEN achievement_record.threshold_field = 'profile_views_count' THEN 
        (SELECT COALESCE(ms.profile_views_count, 0) FROM public.member_stats ms WHERE ms.id = target_user_id)
      WHEN achievement_record.threshold_field = 'votes_with_notes_count' THEN 
        (SELECT COALESCE(ms.votes_with_notes_count, 0) FROM public.member_stats ms WHERE ms.id = target_user_id)
      WHEN achievement_record.threshold_field = 'about_visits' THEN 
        (SELECT COALESCE(ms.about_visits, 0) FROM public.member_stats ms WHERE ms.id = target_user_id)
      WHEN achievement_record.threshold_field = 'blog_visits' THEN 
        (SELECT COALESCE(ms.blog_visits, 0) FROM public.member_stats ms WHERE ms.id = target_user_id)
      WHEN achievement_record.threshold_field = 'cypher_visits' THEN 
        (SELECT COALESCE(ms.cypher_visits, 0) FROM public.member_stats ms WHERE ms.id = target_user_id)
      WHEN achievement_record.threshold_field = 'vs_visits' THEN 
        (SELECT COALESCE(ms.vs_visits, 0) FROM public.member_stats ms WHERE ms.id = target_user_id)
      WHEN achievement_record.threshold_field = 'analytics_visits' THEN 
        (SELECT COALESCE(ms.analytics_visits, 0) FROM public.member_stats ms WHERE ms.id = target_user_id)
      ELSE 0
    END;

    -- Insert new tracking record
    IF current_value >= achievement_record.threshold_value THEN
      INSERT INTO public.user_achievements (user_id, achievement_id, earned_at, progress_value)
      VALUES (target_user_id, achievement_record.id, NOW(), current_value);
    ELSE
      INSERT INTO public.user_achievements (user_id, achievement_id, earned_at, progress_value)
      VALUES (target_user_id, achievement_record.id, NULL, current_value);
    END IF;
  END LOOP;

  -- Return all achievements with progress
  RETURN QUERY
  SELECT 
    a.id as achievement_id,
    a.name as achievement_name,
    a.description as achievement_description,
    a.icon as achievement_icon,
    a.badge_color as achievement_badge_color,
    a.points as achievement_points,
    a.rarity as achievement_rarity,
    a.type as achievement_type,
    a.threshold_value,
    COALESCE(ua.progress_value, 0) as progress_value,
    ua.earned_at,
    (ua.earned_at IS NOT NULL) as is_earned,
    a.series_name,
    a.tier_level,
    a.next_tier_id
  FROM public.achievements a
  LEFT JOIN public.user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = target_user_id
  WHERE a.is_active = true
  ORDER BY a.rarity DESC, a.points DESC, a.name ASC;
END;
$function$;