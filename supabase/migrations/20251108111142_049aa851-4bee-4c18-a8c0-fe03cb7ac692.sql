-- Fix check_and_award_achievements to include cypher_visits and improve progress tracking
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
      WHEN achievement_record.threshold_field = 'blog_visits' THEN COALESCE(ms.blog_visits, 0)
      WHEN achievement_record.threshold_field = 'about_visits' THEN COALESCE(ms.about_visits, 0)
      WHEN achievement_record.threshold_field = 'analytics_visits' THEN COALESCE(ms.analytics_visits, 0)
      WHEN achievement_record.threshold_field = 'vs_visits' THEN COALESCE(ms.vs_visits, 0)
      WHEN achievement_record.threshold_field = 'cypher_visits' THEN COALESCE(ms.cypher_visits, 0)
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

    -- Track progress and award if threshold met
    IF should_award THEN
      INSERT INTO public.user_achievements (user_id, achievement_id, earned_at, progress_value)
      VALUES (target_user_id, achievement_record.id, NOW(), current_value)
      ON CONFLICT (user_id, achievement_id) 
      DO UPDATE SET 
        earned_at = COALESCE(user_achievements.earned_at, NOW()),
        progress_value = EXCLUDED.progress_value;
    ELSE
      -- Track progress even before earning
      INSERT INTO public.user_achievements (user_id, achievement_id, progress_value)
      VALUES (target_user_id, achievement_record.id, current_value)
      ON CONFLICT (user_id, achievement_id) 
      DO UPDATE SET progress_value = EXCLUDED.progress_value
      WHERE user_achievements.earned_at IS NULL;
    END IF;
  END LOOP;
END;
$function$;

-- Update get_user_achievement_progress to show progress from member_stats
CREATE OR REPLACE FUNCTION get_user_achievement_progress(target_user_id uuid DEFAULT auth.uid())
RETURNS TABLE (
  user_id uuid,
  achievement_id uuid,
  name text,
  description text,
  icon text,
  type text,
  rarity text,
  points integer,
  threshold_value integer,
  threshold_field text,
  series_name text,
  tier_level integer,
  next_tier_id uuid,
  badge_color text,
  is_hidden boolean,
  earned_at timestamptz,
  progress_value integer,
  is_earned boolean,
  progress_percentage numeric
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    target_user_id as user_id,
    a.id as achievement_id,
    a.name,
    a.description,
    a.icon,
    a.type,
    a.rarity,
    a.points,
    a.threshold_value,
    a.threshold_field,
    a.series_name,
    a.tier_level,
    a.next_tier_id,
    a.badge_color,
    a.is_hidden,
    ua.earned_at,
    COALESCE(
      ua.progress_value, 
      CASE 
        WHEN a.threshold_field = 'total_votes' THEN ms.total_votes
        WHEN a.threshold_field = 'consecutive_voting_days' THEN ms.consecutive_voting_days
        WHEN a.threshold_field = 'total_comments' THEN ms.total_comments
        WHEN a.threshold_field = 'ranking_lists_created' THEN ms.ranking_lists_created
        WHEN a.threshold_field = 'total_upvotes' THEN ms.total_upvotes
        WHEN a.threshold_field = 'top_five_created' THEN ms.top_five_created
        WHEN a.threshold_field = 'rappers_voted_count' THEN ms.rappers_voted_count
        WHEN a.threshold_field = 'votes_with_notes_count' THEN ms.votes_with_notes_count
        WHEN a.threshold_field = 'cypher_visits' THEN ms.cypher_visits
        WHEN a.threshold_field = 'blog_visits' THEN ms.blog_visits
        WHEN a.threshold_field = 'about_visits' THEN ms.about_visits
        WHEN a.threshold_field = 'analytics_visits' THEN ms.analytics_visits
        WHEN a.threshold_field = 'vs_visits' THEN ms.vs_visits
        ELSE 0
      END,
      0
    ) as progress_value,
    (ua.earned_at IS NOT NULL) as is_earned,
    CASE 
      WHEN a.threshold_value > 0 
      THEN (
        COALESCE(
          ua.progress_value,
          CASE 
            WHEN a.threshold_field = 'total_votes' THEN ms.total_votes
            WHEN a.threshold_field = 'consecutive_voting_days' THEN ms.consecutive_voting_days
            WHEN a.threshold_field = 'total_comments' THEN ms.total_comments
            WHEN a.threshold_field = 'ranking_lists_created' THEN ms.ranking_lists_created
            WHEN a.threshold_field = 'total_upvotes' THEN ms.total_upvotes
            WHEN a.threshold_field = 'top_five_created' THEN ms.top_five_created
            WHEN a.threshold_field = 'rappers_voted_count' THEN ms.rappers_voted_count
            WHEN a.threshold_field = 'votes_with_notes_count' THEN ms.votes_with_notes_count
            WHEN a.threshold_field = 'cypher_visits' THEN ms.cypher_visits
            WHEN a.threshold_field = 'blog_visits' THEN ms.blog_visits
            WHEN a.threshold_field = 'about_visits' THEN ms.about_visits
            WHEN a.threshold_field = 'analytics_visits' THEN ms.analytics_visits
            WHEN a.threshold_field = 'vs_visits' THEN ms.vs_visits
            ELSE 0
          END,
          0
        )::float / a.threshold_value::float * 100
      )
      ELSE 0 
    END as progress_percentage
  FROM achievements a
  LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = target_user_id
  LEFT JOIN member_stats ms ON ms.id = target_user_id
  WHERE a.is_active = true
  ORDER BY a.series_name NULLS LAST, a.tier_level;
$$;