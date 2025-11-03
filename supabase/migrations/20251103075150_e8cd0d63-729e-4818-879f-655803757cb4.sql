-- Fix activity score to count unique views per day over 7-day rolling window
CREATE OR REPLACE FUNCTION public.calculate_rapper_activity_score(rapper_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  unique_views_per_day_count INTEGER;
  seven_days_ago TIMESTAMP WITH TIME ZONE;
BEGIN
  seven_days_ago := NOW() - INTERVAL '7 days';
  
  -- Count unique viewers per calendar day, then sum across all days
  -- This allows the same viewer to count once per day they visit
  SELECT COALESCE(SUM(daily_count), 0)::INTEGER INTO unique_views_per_day_count
  FROM (
    SELECT DATE(viewed_at) as view_date, 
           COUNT(DISTINCT COALESCE(user_id::text, session_id)) as daily_count
    FROM public.rapper_page_views
    WHERE rapper_id = rapper_uuid
      AND viewed_at >= seven_days_ago
    GROUP BY DATE(viewed_at)
  ) daily_views;
  
  RETURN unique_views_per_day_count;
END;
$$;

-- Update comment to reflect new behavior
COMMENT ON FUNCTION public.calculate_rapper_activity_score(UUID) IS 'Calculates activity score based on unique page views per day over the last 7 days - same viewer counts once per day they visit';

-- Recalculate all rapper activity scores with the new logic
SELECT public.update_all_rapper_activity_scores();