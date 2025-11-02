-- Add analytics_visits column to member_stats
ALTER TABLE public.member_stats 
ADD COLUMN IF NOT EXISTS analytics_visits INTEGER DEFAULT 0;

-- Update increment_page_visit_stat to support all page visit types
CREATE OR REPLACE FUNCTION public.increment_page_visit_stat(stat_field TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  IF stat_field = 'blog_visits' THEN
    INSERT INTO public.member_stats (id, blog_visits, updated_at)
    VALUES (auth.uid(), 1, NOW())
    ON CONFLICT (id) DO UPDATE
      SET blog_visits = public.member_stats.blog_visits + 1,
          updated_at = NOW();

  ELSIF stat_field = 'about_visits' THEN
    INSERT INTO public.member_stats (id, about_visits, updated_at)
    VALUES (auth.uid(), 1, NOW())
    ON CONFLICT (id) DO UPDATE
      SET about_visits = public.member_stats.about_visits + 1,
          updated_at = NOW();

  ELSIF stat_field = 'analytics_visits' THEN
    INSERT INTO public.member_stats (id, analytics_visits, updated_at)
    VALUES (auth.uid(), 1, NOW())
    ON CONFLICT (id) DO UPDATE
      SET analytics_visits = public.member_stats.analytics_visits + 1,
          updated_at = NOW();
  END IF;

  PERFORM public.check_and_award_achievements(auth.uid());
END;
$$;

-- Update check_and_award_achievements to consider all visit-based achievements
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  achievement_record RECORD;
  current_value integer;
  should_award boolean;
BEGIN
  FOR achievement_record IN 
    SELECT * FROM public.achievements 
    WHERE is_active = true 
    ORDER BY series_name NULLS LAST, tier_level ASC
  LOOP
    SELECT CASE
      WHEN achievement_record.threshold_field = 'total_votes' THEN COALESCE(ms.total_votes, 0)
      WHEN achievement_record.threshold_field = 'consecutive_voting_days' THEN COALESCE(ms.consecutive_voting_days, 0)
      WHEN achievement_record.threshold_field = 'total_comments' THEN COALESCE(ms.total_comments, 0)
      WHEN achievement_record.threshold_field = 'ranking_lists_created' THEN COALESCE(ms.ranking_lists_created, 0)
      WHEN achievement_record.threshold_field = 'total_upvotes' THEN COALESCE(ms.total_upvotes, 0)
      WHEN achievement_record.threshold_field = 'top_five_created' THEN COALESCE(ms.top_five_created, 0)
      WHEN achievement_record.threshold_field = 'rappers_voted_count' THEN COALESCE(ms.rappers_voted_count, 0)
      WHEN achievement_record.threshold_field = 'votes_with_notes_count' THEN COALESCE(ms.votes_with_notes_count, 0)
      
      -- Page visits tracked in member_stats
      WHEN achievement_record.threshold_field = 'blog_visits' THEN COALESCE(ms.blog_visits, 0)
      WHEN achievement_record.threshold_field = 'about_visits' THEN COALESCE(ms.about_visits, 0)
      WHEN achievement_record.threshold_field = 'analytics_visits' THEN COALESCE(ms.analytics_visits, 0)
      
      -- Profile visit achievements from profile_access_logs
      WHEN achievement_record.threshold_field = 'own_profile_visits' THEN (
        SELECT COUNT(*)::int
        FROM public.profile_access_logs pal
        WHERE pal.accessor_user_id = target_user_id
          AND pal.accessed_profile_id = target_user_id
      )
      WHEN achievement_record.threshold_field = 'profile_views' THEN (
        SELECT COUNT(*)::int
        FROM public.profile_access_logs pal
        WHERE pal.accessor_user_id = target_user_id
          AND pal.accessed_profile_id <> target_user_id
      )
      ELSE 0
    END INTO current_value
    FROM public.member_stats ms
    WHERE ms.id = target_user_id;

    should_award := current_value >= achievement_record.threshold_value;

    IF should_award THEN
      INSERT INTO public.user_achievements (user_id, achievement_id, earned_at)
      VALUES (target_user_id, achievement_record.id, NOW())
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$$;