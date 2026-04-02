
-- Fix 1: Change get_user_achievement_progress from STABLE to VOLATILE since it contains INSERT statements
CREATE OR REPLACE FUNCTION public.get_user_achievement_progress(target_user_id UUID)
RETURNS TABLE (
  achievement_id UUID,
  achievement_name TEXT,
  achievement_description TEXT,
  achievement_icon TEXT,
  achievement_badge_color TEXT,
  achievement_points INTEGER,
  achievement_rarity achievement_rarity,
  achievement_type achievement_type,
  threshold_value INTEGER,
  progress_value INTEGER,
  earned_at TIMESTAMPTZ,
  is_earned BOOLEAN,
  series_name TEXT,
  tier_level INTEGER,
  next_tier_id UUID
)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_value INTEGER;
  achievement_record RECORD;
BEGIN
  FOR achievement_record IN 
    SELECT a.* FROM public.achievements a 
    WHERE a.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements ua 
      WHERE ua.user_id = target_user_id AND ua.achievement_id = a.id
    )
  LOOP
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
        SELECT COUNT(*)::int FROM public.profile_access_logs pal
        WHERE pal.accessor_user_id = target_user_id AND pal.accessed_profile_id = target_user_id
      )
      WHEN achievement_record.threshold_field = 'other_profile_visits' THEN (
        SELECT COUNT(DISTINCT pal.accessed_profile_id)::int FROM public.profile_access_logs pal
        WHERE pal.accessor_user_id = target_user_id AND pal.accessed_profile_id != target_user_id
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

    IF current_value >= achievement_record.threshold_value THEN
      INSERT INTO public.user_achievements (user_id, achievement_id, earned_at, progress_value)
      VALUES (target_user_id, achievement_record.id, NOW(), current_value);
    ELSE
      INSERT INTO public.user_achievements (user_id, achievement_id, earned_at, progress_value)
      VALUES (target_user_id, achievement_record.id, NULL, current_value);
    END IF;
  END LOOP;

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
$$;

-- Fix 2: Make the top five trigger function SECURITY DEFINER to bypass RLS on member_stats
CREATE OR REPLACE FUNCTION public.update_member_stats_on_top_five()
RETURNS TRIGGER
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.member_stats (id, top_five_created, updated_at)
  VALUES (NEW.user_id, 1, NOW())
  ON CONFLICT (id) 
  DO UPDATE SET 
    top_five_created = GREATEST(public.member_stats.top_five_created, 1),
    updated_at = NOW();
  
  PERFORM public.check_and_award_achievements(NEW.user_id);
  
  RETURN NEW;
END;
$$;
