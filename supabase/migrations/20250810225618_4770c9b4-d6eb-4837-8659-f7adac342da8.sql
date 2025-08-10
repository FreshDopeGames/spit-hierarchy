-- Fix MusicBrainz rate limiting table structure and function

-- First, let's check and fix the table structure
ALTER TABLE public.musicbrainz_rate_limits 
DROP CONSTRAINT IF EXISTS musicbrainz_rate_limits_user_id_ip_address_key;

-- Add a unique constraint for the ON CONFLICT to work
ALTER TABLE public.musicbrainz_rate_limits 
ADD CONSTRAINT musicbrainz_rate_limits_user_id_ip_address_key 
UNIQUE (user_id, ip_address);

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
  -- Clean up old records
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

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.check_musicbrainz_rate_limit TO authenticated, anon, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.musicbrainz_rate_limits TO authenticated, anon, service_role;

-- Clear existing records and test
DELETE FROM public.musicbrainz_rate_limits;

-- Test the function
SELECT public.check_musicbrainz_rate_limit(
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid,
  '127.0.0.1',
  10,
  60
) as test_result;