-- Allow true ties in community rankings by removing unique position constraint
BEGIN;

-- 1) Drop the unique constraint that prevents duplicate positions within a ranking
ALTER TABLE public.user_ranking_items 
  DROP CONSTRAINT IF EXISTS user_ranking_items_ranking_id_position_key;

-- 2) (Safety) Ensure the unique constraint on (ranking_id, rapper_id) remains to prevent duplicates per ranking
-- This should already exist; statement is no-op if it does. Uncomment only if needed.
-- ALTER TABLE public.user_ranking_items 
--   ADD CONSTRAINT user_ranking_items_ranking_id_rapper_id_key UNIQUE (ranking_id, rapper_id);

COMMIT;

-- Apply the new logic to the specific community ranking "Soundtrack Heroes"
-- Refresh vote counts first (optional but helpful), then recalc positions
REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_ranking_vote_counts;
SELECT public.update_user_ranking_positions('80aee6db-fe6f-4a68-b0c2-3760ac28493c');