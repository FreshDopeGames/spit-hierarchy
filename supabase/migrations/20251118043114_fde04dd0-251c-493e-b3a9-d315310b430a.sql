-- Phase 1: Remove Blocking Trigger
-- This trigger was causing votes to timeout on large rankings by running synchronous recalculation
-- Positions will be recalculated by daily maintenance job at 3 AM and weekly snapshot job

-- Drop the blocking AFTER INSERT trigger
DROP TRIGGER IF EXISTS auto_recalculate_ranking_positions ON public.ranking_votes;

-- Drop the trigger function (cleanup)
DROP FUNCTION IF EXISTS public.trigger_recalculate_after_vote();

-- Add comment documenting the change
COMMENT ON TABLE public.ranking_votes IS 'Stores weighted votes for official rankings. Positions are recalculated by scheduled maintenance jobs (daily at 3 AM, weekly snapshots Sunday 11:59 PM) rather than on every vote for performance.';

-- Verify daily maintenance function exists and is scheduled correctly
-- This function already exists and handles position recalculation for all rankings
-- It runs via pg_cron daily at 3 AM as configured in existing migrations