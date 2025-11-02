-- Enable RLS on the user_achievement_progress view and add policies
ALTER VIEW user_achievement_progress SET (security_barrier = true);

-- Grant usage to authenticated users
GRANT SELECT ON user_achievement_progress TO authenticated;

-- Create a policy-like function to secure the view
-- Since views don't support RLS directly, we'll recreate it with a security barrier
DROP VIEW IF EXISTS user_achievement_progress;

CREATE VIEW user_achievement_progress 
WITH (security_barrier = true) AS
SELECT 
  ua.user_id,
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
CROSS JOIN auth.users u
LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND u.id = ua.user_id
WHERE a.is_active = true
  AND u.id = auth.uid(); -- Only show data for the current user

-- Grant select to authenticated users
GRANT SELECT ON user_achievement_progress TO authenticated;