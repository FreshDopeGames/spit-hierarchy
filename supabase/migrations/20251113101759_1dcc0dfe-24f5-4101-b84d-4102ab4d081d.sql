-- Clean up false positive achievement notifications
-- Only delete notifications for achievements that are currently unearned (earned_at = NULL)
DELETE FROM public.notifications n
WHERE n.type = 'achievement'
  AND EXISTS (
    SELECT 1 
    FROM public.user_achievements ua
    WHERE ua.user_id = n.user_id
      AND ua.achievement_id = (n.metadata->>'achievementId')::uuid
      AND ua.earned_at IS NULL
  );