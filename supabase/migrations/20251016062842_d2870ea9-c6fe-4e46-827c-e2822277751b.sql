-- Drop the existing non-unique index
DROP INDEX IF EXISTS public.idx_user_ranking_vote_counts_lookup;

-- Create a UNIQUE index on the materialized view to support CONCURRENT refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_ranking_vote_counts_unique_lookup 
  ON public.user_ranking_vote_counts(user_ranking_id, rapper_id);