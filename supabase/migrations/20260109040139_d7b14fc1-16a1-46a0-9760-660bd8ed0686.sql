-- Drop the old function first since we're changing its return type
DROP FUNCTION IF EXISTS public.increment_session_count();

-- Recreate the function with JSONB return type and daily limit logic
CREATE OR REPLACE FUNCTION public.increment_session_count()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_daily_count INTEGER;
  current_last_date DATE;
  new_session_count INTEGER;
  xp_awarded BOOLEAN := FALSE;
BEGIN
  -- Get current values
  SELECT session_count, daily_sessions_count, last_session_date
  INTO new_session_count, current_daily_count, current_last_date
  FROM public.member_stats
  WHERE id = auth.uid();
  
  -- Handle new user or existing user
  IF new_session_count IS NULL THEN
    -- New user: insert with first session
    INSERT INTO public.member_stats (id, session_count, daily_sessions_count, last_session_date, updated_at)
    VALUES (auth.uid(), 1, 1, CURRENT_DATE, NOW())
    RETURNING session_count INTO new_session_count;
    xp_awarded := TRUE;
    current_daily_count := 1;
  ELSIF current_last_date IS NULL OR current_last_date < CURRENT_DATE THEN
    -- New day: reset daily count
    UPDATE public.member_stats
    SET session_count = session_count + 1,
        daily_sessions_count = 1,
        last_session_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE id = auth.uid()
    RETURNING session_count INTO new_session_count;
    xp_awarded := TRUE;
    current_daily_count := 1;
  ELSIF current_daily_count < 2 THEN
    -- Same day, under limit
    UPDATE public.member_stats
    SET session_count = session_count + 1,
        daily_sessions_count = daily_sessions_count + 1,
        updated_at = NOW()
    WHERE id = auth.uid()
    RETURNING session_count, daily_sessions_count INTO new_session_count, current_daily_count;
    xp_awarded := TRUE;
  ELSE
    -- Same day, at limit - no XP awarded
    xp_awarded := FALSE;
  END IF;
  
  -- Only check achievements if XP was awarded
  IF xp_awarded THEN
    PERFORM public.check_and_award_achievements(auth.uid());
  END IF;
  
  RETURN jsonb_build_object(
    'session_count', new_session_count,
    'xp_awarded', xp_awarded,
    'daily_sessions_remaining', GREATEST(0, 2 - COALESCE(current_daily_count, 0))
  );
END;
$$;