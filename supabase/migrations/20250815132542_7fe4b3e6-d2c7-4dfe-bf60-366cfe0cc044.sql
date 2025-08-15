-- Fix Security Definer Views by recreating them with SECURITY INVOKER
-- This ensures views execute with the permissions of the querying user, not the view creator

-- Drop existing views first
DROP VIEW IF EXISTS public.user_achievement_progress;
DROP VIEW IF EXISTS public.rapper_vote_stats;
DROP VIEW IF EXISTS public.rapper_voting_analytics;

-- Recreate rapper_voting_analytics view with SECURITY INVOKER
CREATE VIEW public.rapper_voting_analytics 
WITH (security_invoker = true) AS
SELECT 
    r.id,
    r.name,
    COALESCE(count(v.id), 0::bigint) AS total_votes,
    COALESCE(count(DISTINCT v.user_id), 0::bigint) AS unique_voters,
    COALESCE(avg(v.rating), 0::numeric) AS average_rating
FROM rappers r
LEFT JOIN votes v ON r.id = v.rapper_id
GROUP BY r.id, r.name
ORDER BY COALESCE(count(v.id), 0::bigint) DESC, COALESCE(avg(v.rating), 0::numeric) DESC;

-- Recreate rapper_vote_stats view with SECURITY INVOKER
CREATE VIEW public.rapper_vote_stats 
WITH (security_invoker = true) AS
SELECT 
    r.id,
    r.name,
    r.slug,
    count(v.id) AS total_votes,
    count(DISTINCT v.user_id) AS unique_voters,
    round(avg(v.rating), 2) AS average_rating,
    count(CASE WHEN v.created_at >= (now() - '7 days'::interval) THEN 1 ELSE NULL::integer END) AS votes_last_7_days,
    count(CASE WHEN v.created_at >= (now() - '30 days'::interval) THEN 1 ELSE NULL::integer END) AS votes_last_30_days,
    min(v.created_at) AS first_vote_date,
    max(v.created_at) AS last_vote_date
FROM rappers r
LEFT JOIN votes v ON r.id = v.rapper_id
GROUP BY r.id, r.name, r.slug;

-- Recreate user_achievement_progress view with SECURITY INVOKER
CREATE VIEW public.user_achievement_progress 
WITH (security_invoker = true) AS
SELECT 
    p.id AS user_id,
    a.id AS achievement_id,
    a.name,
    a.description,
    a.icon,
    a.type,
    a.rarity,
    a.points,
    a.threshold_value,
    a.threshold_field,
    ua.earned_at,
    CASE
        WHEN a.threshold_field = 'total_votes'::text THEN COALESCE(ms.total_votes, 0)
        WHEN a.threshold_field = 'consecutive_voting_days'::text THEN COALESCE(ms.consecutive_voting_days, 0)
        WHEN a.threshold_field = 'total_comments'::text THEN COALESCE(ms.total_comments, 0)
        WHEN a.threshold_field = 'ranking_lists_created'::text THEN COALESCE(ms.ranking_lists_created, 0)
        WHEN a.threshold_field = 'total_upvotes'::text THEN COALESCE(ms.total_upvotes, 0)
        WHEN a.threshold_field = 'top_five_created'::text THEN COALESCE(ms.top_five_created, 0)
        ELSE 0
    END AS progress_value,
    (ua.id IS NOT NULL) AS is_earned,
    CASE
        WHEN ua.id IS NOT NULL THEN 100.0::double precision
        WHEN a.threshold_value > 0 THEN 
            LEAST(100.0::double precision, 
                ((CASE
                    WHEN a.threshold_field = 'total_votes'::text THEN COALESCE(ms.total_votes, 0)
                    WHEN a.threshold_field = 'consecutive_voting_days'::text THEN COALESCE(ms.consecutive_voting_days, 0)
                    WHEN a.threshold_field = 'total_comments'::text THEN COALESCE(ms.total_comments, 0)
                    WHEN a.threshold_field = 'ranking_lists_created'::text THEN COALESCE(ms.ranking_lists_created, 0)
                    WHEN a.threshold_field = 'total_upvotes'::text THEN COALESCE(ms.total_upvotes, 0)
                    WHEN a.threshold_field = 'top_five_created'::text THEN COALESCE(ms.top_five_created, 0)
                    ELSE 0
                END)::double precision / a.threshold_value::double precision) * 100.0::double precision)
        ELSE 0.0::double precision
    END AS progress_percentage
FROM profiles p
CROSS JOIN achievements a
LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND p.id = ua.user_id
LEFT JOIN member_stats ms ON p.id = ms.id
WHERE a.is_active = true;