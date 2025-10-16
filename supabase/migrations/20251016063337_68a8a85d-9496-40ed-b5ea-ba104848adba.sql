-- Clean up test votes for "Soundtrack Heroes" community ranking
DELETE FROM public.user_ranking_votes 
WHERE user_ranking_id = '80aee6db-fe6f-4a68-b0c2-3760ac28493c';

DELETE FROM public.daily_vote_tracking 
WHERE user_ranking_id = '80aee6db-fe6f-4a68-b0c2-3760ac28493c';

-- Refresh the materialized view to reflect the deletion
REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_ranking_vote_counts;