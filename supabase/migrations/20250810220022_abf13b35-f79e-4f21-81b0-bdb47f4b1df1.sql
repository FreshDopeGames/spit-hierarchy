-- Fix MusicBrainz rate limiting permissions and function issues

-- Drop the existing function to ensure clean state
DROP FUNCTION IF EXISTS public.check_musicbrainz_rate_limit(uuid, text, integer, integer);
DROP FUNCTION IF EXISTS public.check_musicbrainz_rate_limit(uuid, inet, integer, integer);

-- Recreate the function with proper permissions and fixed logic
CREATE OR REPLACE FUNCTION public.check_musicbrainz_rate_limit(
  p_user_id UUID DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_max_requests INTEGER DEFAULT 10,
  p_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  window_start_time timestamp := now() - (p_window_minutes || ' minutes')::interval;
  current_count integer := 0;
BEGIN
  -- Clean up old records (this should work now with proper permissions)
  DELETE FROM public.musicbrainz_rate_limits 
  WHERE window_start < window_start_time;
  
  -- Check current request count
  SELECT COALESCE(SUM(request_count), 0) INTO current_count
  FROM public.musicbrainz_rate_limits
  WHERE (user_id = p_user_id OR ip_address::text = p_ip_address)
    AND window_start >= window_start_time;
  
  -- If under limit, record this request
  IF current_count < p_max_requests THEN
    INSERT INTO public.musicbrainz_rate_limits (user_id, ip_address, window_start)
    VALUES (p_user_id, p_ip_address::inet, now())
    ON CONFLICT (user_id, ip_address) 
    DO UPDATE SET 
      request_count = public.musicbrainz_rate_limits.request_count + 1,
      updated_at = now();
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions to the function
GRANT EXECUTE ON FUNCTION public.check_musicbrainz_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_musicbrainz_rate_limit TO anon;
GRANT EXECUTE ON FUNCTION public.check_musicbrainz_rate_limit TO service_role;

-- Ensure proper permissions on the rate limits table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.musicbrainz_rate_limits TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.musicbrainz_rate_limits TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.musicbrainz_rate_limits TO service_role;

-- Clear any existing rate limit records to start fresh
DELETE FROM public.musicbrainz_rate_limits WHERE window_start < now() - interval '2 hours';

-- Test the function to ensure it works
DO $$
DECLARE
  test_result boolean;
BEGIN
  -- Test the rate limiting function
  SELECT public.check_musicbrainz_rate_limit(
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid,
    '127.0.0.1',
    10,
    60
  ) INTO test_result;
  
  IF test_result = true THEN
    RAISE NOTICE 'Rate limiting function test: PASSED';
  ELSE
    RAISE NOTICE 'Rate limiting function test: FAILED';
  END IF;
END $$;