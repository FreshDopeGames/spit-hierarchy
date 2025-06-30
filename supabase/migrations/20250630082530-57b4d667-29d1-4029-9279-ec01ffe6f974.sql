
-- Remove the unique constraint that prevents multiple votes per user/rapper/ranking
-- This allows cumulative daily voting over time
ALTER TABLE public.ranking_votes DROP CONSTRAINT IF EXISTS ranking_votes_user_id_ranking_id_rapper_id_key;

-- Add a vote_date column to track when votes were cast (date only, not timestamp)
ALTER TABLE public.ranking_votes ADD COLUMN IF NOT EXISTS vote_date DATE DEFAULT CURRENT_DATE;

-- Create an index for efficient querying by date
CREATE INDEX IF NOT EXISTS idx_ranking_votes_date_lookup ON public.ranking_votes(user_id, ranking_id, rapper_id, vote_date);

-- Update existing records to have today's date if vote_date is null
UPDATE public.ranking_votes SET vote_date = CURRENT_DATE WHERE vote_date IS NULL;

-- Modify the daily_vote_tracking table to be more specific about daily limits
-- Keep the existing unique constraint but make it work with the new daily voting logic
-- The constraint should prevent multiple votes on the same day, not multiple votes ever
