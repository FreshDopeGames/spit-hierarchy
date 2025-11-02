-- Drop and recreate the user_achievement_progress view with all required fields
DROP VIEW IF EXISTS user_achievement_progress;

CREATE VIEW user_achievement_progress AS
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
WHERE a.is_active = true;