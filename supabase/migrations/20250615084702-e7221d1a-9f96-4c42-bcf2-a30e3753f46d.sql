
DROP VIEW IF EXISTS public.user_achievement_progress;

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
