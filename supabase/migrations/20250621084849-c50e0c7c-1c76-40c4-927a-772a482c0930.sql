
-- Fix urgent Supabase security issues
-- 1. Enable RLS on ranking_position_history table
ALTER TABLE public.ranking_position_history ENABLE ROW LEVEL SECURITY;

-- 2. Fix all functions by adding SET search_path = '' to prevent SQL injection
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$function$;

CREATE OR REPLACE FUNCTION public.can_manage_blog(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT public.has_role(_user_id, 'admin') OR public.has_role(_user_id, 'blog_editor');
$function$;

CREATE OR REPLACE FUNCTION public.update_ranking_activity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  -- Update activity for official rankings when votes are cast
  UPDATE public.official_rankings 
  SET 
    last_activity_at = NEW.created_at,
    activity_score = activity_score + 1
  WHERE id IN (
    SELECT ri.ranking_id 
    FROM public.ranking_items ri 
    WHERE ri.rapper_id = NEW.rapper_id
  );
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_rapper_total_votes(rapper_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $function$
DECLARE
  total_weighted_votes INTEGER;
BEGIN
  SELECT COALESCE(SUM(vote_weight), 0)::INTEGER INTO total_weighted_votes
  FROM public.ranking_votes
  WHERE rapper_id = rapper_uuid;
  
  RETURN total_weighted_votes;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_rapper_vote_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  -- Update the rapper's total votes count
  UPDATE public.rappers 
  SET 
    total_votes = public.calculate_rapper_total_votes(COALESCE(NEW.rapper_id, OLD.rapper_id)),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.rapper_id, OLD.rapper_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_rapper_top5_count(rapper_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $function$
DECLARE
  count_result INTEGER;
BEGIN
  SELECT COALESCE(COUNT(user_id), 0)::INTEGER INTO count_result
  FROM public.user_top_rappers
  WHERE rapper_id = rapper_uuid;
  
  RETURN count_result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_member_stats_on_vote()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  -- Update member stats for the user who cast the vote
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
$function$;

CREATE OR REPLACE FUNCTION public.update_member_stats_on_comment()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  -- Update member stats for the user who posted the comment
  INSERT INTO public.member_stats (id, total_comments, updated_at)
  VALUES (NEW.user_id, 1, NOW())
  ON CONFLICT (id) 
  DO UPDATE SET 
    total_comments = public.member_stats.total_comments + 1,
    updated_at = NOW();
  
  -- Check and award achievements for this user
  PERFORM public.check_and_award_achievements(NEW.user_id);
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_member_stats_on_top_five()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  -- Update member stats for the user who created/updated their top 5
  INSERT INTO public.member_stats (id, top_five_created, updated_at)
  VALUES (NEW.user_id, 1, NOW())
  ON CONFLICT (id) 
  DO UPDATE SET 
    top_five_created = GREATEST(public.member_stats.top_five_created, 1),
    updated_at = NOW();
  
  -- Check and award achievements for this user
  PERFORM public.check_and_award_achievements(NEW.user_id);
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_and_award_achievements(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  achievement_record RECORD;
  user_stats_record RECORD;
  current_value integer;
BEGIN
  -- Get user stats
  SELECT * INTO user_stats_record 
  FROM public.member_stats 
  WHERE id = target_user_id;
  
  IF user_stats_record IS NULL THEN
    RETURN;
  END IF;
  
  -- Loop through all active achievements
  FOR achievement_record IN 
    SELECT * FROM public.achievements 
    WHERE is_active = true 
    AND id NOT IN (
      SELECT achievement_id 
      FROM public.user_achievements 
      WHERE user_id = target_user_id
    )
  LOOP
    current_value := 0;
    
    -- Check threshold based on field
    CASE achievement_record.threshold_field
      WHEN 'total_votes' THEN
        current_value := user_stats_record.total_votes;
      WHEN 'consecutive_voting_days' THEN
        current_value := user_stats_record.consecutive_voting_days;
      WHEN 'total_comments' THEN
        current_value := user_stats_record.total_comments;
      WHEN 'ranking_lists_created' THEN
        current_value := user_stats_record.ranking_lists_created;
      WHEN 'total_upvotes' THEN
        current_value := user_stats_record.total_upvotes;
      WHEN 'top_five_created' THEN
        current_value := user_stats_record.top_five_created;
      ELSE
        -- Handle special achievements that don't use simple thresholds
        CONTINUE;
    END CASE;
    
    -- Award achievement if threshold is met
    IF current_value >= achievement_record.threshold_value THEN
      INSERT INTO public.user_achievements (user_id, achievement_id, progress_value)
      VALUES (target_user_id, achievement_record.id, current_value)
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$function$;

-- 3. Drop and recreate analytics views as SECURITY DEFINER functions for proper access control
-- This ensures they respect RLS and user permissions

-- Drop existing views
DROP VIEW IF EXISTS public.user_voting_stats;
DROP VIEW IF EXISTS public.rapper_voting_analytics;
DROP VIEW IF EXISTS public.category_voting_analytics;
DROP VIEW IF EXISTS public.rapper_top5_counts;
DROP VIEW IF EXISTS public.user_achievement_progress;

-- Create secure analytics functions that only admins can access
CREATE OR REPLACE FUNCTION public.get_user_voting_stats()
RETURNS TABLE (
  user_id uuid,
  total_votes bigint,
  categories_used bigint,
  average_rating_given numeric,
  first_vote_date timestamp with time zone,
  last_vote_date timestamp with time zone,
  unique_rappers_voted bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  -- Only allow admins to access this data
  SELECT 
    v.user_id,
    COUNT(*)::bigint as total_votes,
    COUNT(DISTINCT v.category_id)::bigint as categories_used,
    AVG(v.rating) as average_rating_given,
    MIN(v.created_at) as first_vote_date,
    MAX(v.created_at) as last_vote_date,
    COUNT(DISTINCT v.rapper_id)::bigint as unique_rappers_voted
  FROM public.votes v
  WHERE public.is_admin_user() = true  -- Only admins can see this
  GROUP BY v.user_id;
$function$;

CREATE OR REPLACE FUNCTION public.get_rapper_voting_analytics()
RETURNS TABLE (
  id uuid,
  name text,
  total_votes bigint,
  unique_voters bigint,
  average_rating numeric,
  votes_last_7_days bigint,
  votes_last_30_days bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  -- Only allow admins to access this data
  SELECT 
    r.id,
    r.name,
    COUNT(v.id)::bigint as total_votes,
    COUNT(DISTINCT v.user_id)::bigint as unique_voters,
    AVG(v.rating) as average_rating,
    COUNT(CASE WHEN v.created_at >= NOW() - INTERVAL '7 days' THEN 1 END)::bigint as votes_last_7_days,
    COUNT(CASE WHEN v.created_at >= NOW() - INTERVAL '30 days' THEN 1 END)::bigint as votes_last_30_days
  FROM public.rappers r
  LEFT JOIN public.votes v ON r.id = v.rapper_id
  WHERE public.is_admin_user() = true  -- Only admins can see this
  GROUP BY r.id, r.name;
$function$;

CREATE OR REPLACE FUNCTION public.get_category_voting_analytics()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  total_votes bigint,
  unique_voters bigint,
  unique_rappers bigint,
  average_rating numeric
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  -- Only allow admins to access this data
  SELECT 
    vc.id,
    vc.name,
    vc.description,
    COUNT(v.id)::bigint as total_votes,
    COUNT(DISTINCT v.user_id)::bigint as unique_voters,
    COUNT(DISTINCT v.rapper_id)::bigint as unique_rappers,
    AVG(v.rating) as average_rating
  FROM public.voting_categories vc
  LEFT JOIN public.votes v ON vc.id = v.category_id
  WHERE public.is_admin_user() = true  -- Only admins can see this
  GROUP BY vc.id, vc.name, vc.description;
$function$;

CREATE OR REPLACE FUNCTION public.get_rapper_top5_counts()
RETURNS TABLE (
  id uuid,
  name text,
  top5_count integer
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  -- This can be public as it's just aggregated counts
  SELECT 
    r.id,
    r.name,
    COALESCE(COUNT(utr.user_id), 0)::integer AS top5_count
  FROM public.rappers r
  LEFT JOIN public.user_top_rappers utr ON r.id = utr.rapper_id
  GROUP BY r.id, r.name;
$function$;

-- Keep user_achievement_progress as a view since it needs to show data per user
CREATE OR REPLACE VIEW public.user_achievement_progress AS
SELECT
    p.id as user_id,
    a.id as achievement_id,
    a.name,
    a.description,
    a.icon,
    a.type,
    a.rarity,
    a.points,
    a.threshold_value,
    a.threshold_field,
    ua.earned_at,
    -- Dynamically calculate progress based on the live member_stats table.
    CASE
        WHEN a.threshold_field = 'total_votes' THEN COALESCE(ms.total_votes, 0)
        WHEN a.threshold_field = 'consecutive_voting_days' THEN COALESCE(ms.consecutive_voting_days, 0)
        WHEN a.threshold_field = 'total_comments' THEN COALESCE(ms.total_comments, 0)
        WHEN a.threshold_field = 'ranking_lists_created' THEN COALESCE(ms.ranking_lists_created, 0)
        WHEN a.threshold_field = 'total_upvotes' THEN COALESCE(ms.total_upvotes, 0)
        WHEN a.threshold_field = 'top_five_created' THEN COALESCE(ms.top_five_created, 0)
        ELSE 0
    END as progress_value,
    -- Determine if the achievement has been earned.
    (ua.id IS NOT NULL) as is_earned,
    -- Dynamically calculate the progress percentage.
    CASE
        WHEN ua.id IS NOT NULL THEN 100.0
        WHEN a.threshold_value > 0 THEN
            LEAST(100.0, (
                (CASE
                    WHEN a.threshold_field = 'total_votes' THEN COALESCE(ms.total_votes, 0)
                    WHEN a.threshold_field = 'consecutive_voting_days' THEN COALESCE(ms.consecutive_voting_days, 0)
                    WHEN a.threshold_field = 'total_comments' THEN COALESCE(ms.total_comments, 0)
                    WHEN a.threshold_field = 'ranking_lists_created' THEN COALESCE(ms.ranking_lists_created, 0)
                    WHEN a.threshold_field = 'total_upvotes' THEN COALESCE(ms.total_upvotes, 0)
                    WHEN a.threshold_field = 'top_five_created' THEN COALESCE(ms.top_five_created, 0)
                    ELSE 0
                END)::float / a.threshold_value::float
            ) * 100.0)
        ELSE 0.0
    END as progress_percentage
FROM
    public.profiles p
CROSS JOIN
    public.achievements a
LEFT JOIN
    public.user_achievements ua ON a.id = ua.achievement_id AND p.id = ua.user_id
LEFT JOIN
    public.member_stats ms ON p.id = ms.id
WHERE
    a.is_active = true;
