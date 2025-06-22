
-- Create the missing rapper_voting_analytics view that the update_rapper_stats function expects
CREATE OR REPLACE VIEW public.rapper_voting_analytics AS
SELECT 
  r.id,
  r.name,
  COALESCE(COUNT(v.id), 0)::bigint as total_votes,
  COALESCE(COUNT(DISTINCT v.user_id), 0)::bigint as unique_voters,
  COALESCE(AVG(v.rating), 0) as average_rating
FROM public.rappers r
LEFT JOIN public.votes v ON r.id = v.rapper_id
GROUP BY r.id, r.name
ORDER BY total_votes DESC, average_rating DESC;
