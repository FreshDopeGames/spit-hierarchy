-- Phase 2: Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;
GRANT USAGE ON SCHEMA cron TO postgres;

-- Phase 3: Replace weekly snapshot with daily snapshot function
DROP FUNCTION IF EXISTS public.create_weekly_ranking_snapshot();

CREATE OR REPLACE FUNCTION public.create_daily_ranking_snapshot()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_snapshot_date TIMESTAMP WITH TIME ZONE;
  deleted_count INTEGER;
  inserted_count INTEGER;
BEGIN
  -- Set snapshot date to today at midnight UTC
  current_snapshot_date := date_trunc('day', now());
  
  -- Clean up old snapshots (keep 30 days)
  DELETE FROM public.ranking_position_history 
  WHERE snapshot_date < current_snapshot_date - INTERVAL '30 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE NOTICE 'Cleaned up % old snapshots', deleted_count;
  
  -- Insert current positions as daily snapshot (official rankings only)
  INSERT INTO public.ranking_position_history (ranking_id, rapper_id, position, snapshot_date)
  SELECT 
    ri.ranking_id,
    ri.rapper_id,
    ri.position,
    current_snapshot_date
  FROM public.ranking_items ri
  WHERE ri.ranking_id IN (SELECT id FROM public.official_rankings)
  ON CONFLICT (ranking_id, rapper_id, snapshot_date) DO UPDATE SET
    position = EXCLUDED.position;
  
  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RAISE NOTICE 'Created daily snapshot for % items at %', inserted_count, current_snapshot_date;
END;
$$;

-- Phase 4: Update position delta function for daily comparison
CREATE OR REPLACE FUNCTION public.get_position_delta(p_ranking_id uuid, p_rapper_id uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  current_position INTEGER;
  yesterday_position INTEGER;
  yesterday_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate yesterday at midnight UTC
  yesterday_date := date_trunc('day', now() - INTERVAL '1 day');
  
  -- Get current position
  SELECT position INTO current_position
  FROM public.ranking_items
  WHERE ranking_id = p_ranking_id AND rapper_id = p_rapper_id;
  
  -- Get position from yesterday's snapshot
  SELECT position INTO yesterday_position
  FROM public.ranking_position_history
  WHERE ranking_id = p_ranking_id 
    AND rapper_id = p_rapper_id 
    AND snapshot_date = yesterday_date;
  
  -- Return delta (negative = improved position, positive = dropped)
  IF yesterday_position IS NULL THEN
    RETURN 0; -- No change if no historical data (new rapper or first snapshot)
  END IF;
  
  RETURN current_position - yesterday_position;
END;
$$;

-- Phase 5: Schedule daily snapshot at 3 AM UTC
SELECT cron.schedule(
  'daily-ranking-snapshot',
  '0 3 * * *',
  $$SELECT public.create_daily_ranking_snapshot();$$
);

-- Phase 6: Create initial snapshot for immediate comparison
SELECT public.create_daily_ranking_snapshot();