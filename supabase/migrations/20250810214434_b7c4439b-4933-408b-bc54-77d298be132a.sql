-- Fix the critical bug in check_musicbrainz_rate_limit function
-- The variable 'window_start' conflicts with the column name
CREATE OR REPLACE FUNCTION check_musicbrainz_rate_limit(
  p_user_id UUID DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_max_requests INTEGER DEFAULT 10,
  p_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  window_start_time timestamp := now() - (p_window_minutes || ' minutes')::interval;
  current_count integer := 0;
BEGIN
  -- Clean up old records (fixed variable name collision)
  DELETE FROM musicbrainz_rate_limits 
  WHERE window_start < window_start_time;
  
  -- Check current request count
  SELECT COALESCE(SUM(request_count), 0) INTO current_count
  FROM musicbrainz_rate_limits
  WHERE (user_id = p_user_id OR ip_address = p_ip_address)
    AND window_start >= window_start_time;
  
  -- If under limit, record this request
  IF current_count < p_max_requests THEN
    INSERT INTO musicbrainz_rate_limits (user_id, ip_address, window_start)
    VALUES (p_user_id, p_ip_address, now())
    ON CONFLICT (user_id, ip_address) 
    DO UPDATE SET 
      request_count = musicbrainz_rate_limits.request_count + 1,
      updated_at = now();
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Clear existing rate limit records to reset the state
DELETE FROM musicbrainz_rate_limits WHERE window_start < now() - interval '1 hour';