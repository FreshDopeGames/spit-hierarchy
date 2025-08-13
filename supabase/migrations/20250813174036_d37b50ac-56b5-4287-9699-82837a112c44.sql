-- Fix the security definer view issue by recreating the rapper_vote_stats view
-- without the security_barrier option

-- Drop the existing view
DROP VIEW IF EXISTS public.rapper_vote_stats;

-- Recreate the view without security_barrier
CREATE VIEW public.rapper_vote_stats AS
SELECT 
    r.id,
    r.name,
    r.slug,
    COUNT(v.id) AS total_votes,
    COUNT(DISTINCT v.user_id) AS unique_voters,
    ROUND(AVG(v.rating), 2) AS average_rating,
    COUNT(CASE WHEN v.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) AS votes_last_7_days,
    COUNT(CASE WHEN v.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) AS votes_last_30_days,
    MIN(v.created_at) AS first_vote_date,
    MAX(v.created_at) AS last_vote_date
FROM public.rappers r
LEFT JOIN public.votes v ON r.id = v.rapper_id
GROUP BY r.id, r.name, r.slug;

-- Grant appropriate permissions
GRANT SELECT ON public.rapper_vote_stats TO authenticated;
GRANT SELECT ON public.rapper_vote_stats TO anon;