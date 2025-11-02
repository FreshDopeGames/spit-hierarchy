-- Drop the problematic view
DROP VIEW IF EXISTS user_achievement_progress;

-- Create a function that returns all achievements with user progress
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
    COALESCE(ua.progress_value, 0) as progress_value,
    (ua.earned_at IS NOT NULL) as is_earned,
    CASE 
      WHEN a.threshold_value > 0 
      THEN (COALESCE(ua.progress_value, 0)::float / a.threshold_value::float * 100)
      ELSE 0 
    END as progress_percentage
  FROM achievements a
  LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = target_user_id
  WHERE a.is_active = true
  ORDER BY a.series_name NULLS LAST, a.tier_level;
$$;