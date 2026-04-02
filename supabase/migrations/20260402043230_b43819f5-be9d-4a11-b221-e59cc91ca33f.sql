
UPDATE member_stats
SET status = CASE
  WHEN total_xp >= 7000 THEN 'diamond'
  WHEN total_xp >= 3500 THEN 'platinum'
  WHEN total_xp >= 1500 THEN 'gold'
  WHEN total_xp >= 500 THEN 'silver'
  ELSE 'bronze'
END::member_status,
updated_at = now()
FROM (
  SELECT ms.id,
    COALESCE((SELECT SUM(a.points) FROM user_achievements ua JOIN achievements a ON a.id = ua.achievement_id WHERE ua.user_id = ms.id AND ua.earned_at IS NOT NULL), 0)
    + (ms.session_count * 10) as total_xp
  FROM member_stats ms
) xp
WHERE member_stats.id = xp.id;
