-- Phase 2: Database Functions for Activity Score Calculation

-- Function to calculate activity score for a specific rapper
-- Returns the count of unique views in the last 7 days
CREATE OR REPLACE FUNCTION public.calculate_rapper_activity_score(rapper_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  unique_view_count INTEGER;
  seven_days_ago TIMESTAMP WITH TIME ZONE;
BEGIN
  seven_days_ago := NOW() - INTERVAL '7 days';
  
  -- Count unique viewers (by user_id or session_id) in the last 7 days
  SELECT COUNT(DISTINCT COALESCE(user_id::text, session_id)) INTO unique_view_count
  FROM public.rapper_page_views
  WHERE rapper_id = rapper_uuid
    AND viewed_at >= seven_days_ago;
  
  RETURN COALESCE(unique_view_count, 0);
END;
$$;

-- Function to update activity scores for all rappers
-- This should be run on a schedule (daily recommended)
CREATE OR REPLACE FUNCTION public.update_all_rapper_activity_scores()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  rapper_record RECORD;
  new_score INTEGER;
BEGIN
  -- Loop through all rappers and update their activity scores
  FOR rapper_record IN SELECT id FROM public.rappers LOOP
    new_score := public.calculate_rapper_activity_score(rapper_record.id);
    
    UPDATE public.rappers
    SET activity_score = new_score,
        updated_at = NOW()
    WHERE id = rapper_record.id;
  END LOOP;
  
  RAISE NOTICE 'Updated activity scores for all rappers at %', NOW();
END;
$$;

-- Function to clean up old page view records
-- Removes records older than 30 days to keep table size manageable
CREATE OR REPLACE FUNCTION public.cleanup_old_page_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count INTEGER;
  thirty_days_ago TIMESTAMP WITH TIME ZONE;
BEGIN
  thirty_days_ago := NOW() - INTERVAL '30 days';
  
  DELETE FROM public.rapper_page_views
  WHERE viewed_at < thirty_days_ago;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE NOTICE 'Deleted % old page view records at %', deleted_count, NOW();
END;
$$;

-- Optional: Trigger function to update activity score on new page view
-- This provides real-time updates but may impact performance
CREATE OR REPLACE FUNCTION public.update_rapper_activity_on_view()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_score INTEGER;
BEGIN
  -- Calculate and update the activity score for the viewed rapper
  new_score := public.calculate_rapper_activity_score(NEW.rapper_id);
  
  UPDATE public.rappers
  SET activity_score = new_score,
      updated_at = NOW()
  WHERE id = NEW.rapper_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update activity score on new page views
-- Note: This trigger updates on every view, which may impact performance
-- Consider disabling this and using the scheduled update_all_rapper_activity_scores() instead
CREATE TRIGGER rapper_page_view_activity_trigger
AFTER INSERT ON public.rapper_page_views
FOR EACH ROW
EXECUTE FUNCTION public.update_rapper_activity_on_view();

-- Grant execute permissions to authenticated users for the calculation function
GRANT EXECUTE ON FUNCTION public.calculate_rapper_activity_score(UUID) TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION public.calculate_rapper_activity_score(UUID) IS 'Calculates activity score based on unique page views in the last 7 days';
COMMENT ON FUNCTION public.update_all_rapper_activity_scores() IS 'Updates activity scores for all rappers - should be run daily via cron';
COMMENT ON FUNCTION public.cleanup_old_page_views() IS 'Removes page view records older than 30 days - should be run weekly via cron';