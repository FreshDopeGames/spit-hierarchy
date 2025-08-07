-- Fix search path for the new MusicBrainz functions to address security warnings
CREATE OR REPLACE FUNCTION public.fetch_musicbrainz_discography(
  p_rapper_id uuid,
  p_force_refresh boolean DEFAULT false,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  start_time timestamp := clock_timestamp();
  execution_time integer;
  result jsonb;
  audit_id uuid;
BEGIN
  -- Create audit log entry
  INSERT INTO musicbrainz_audit_logs (
    rapper_id, action, status, user_id, request_data
  ) VALUES (
    p_rapper_id, 'FETCH_DISCOGRAPHY', 'STARTED', p_user_id,
    jsonb_build_object('force_refresh', p_force_refresh)
  ) RETURNING id INTO audit_id;

  -- Check if rapper exists
  IF NOT EXISTS (SELECT 1 FROM rappers WHERE id = p_rapper_id) THEN
    execution_time := EXTRACT(epoch FROM clock_timestamp() - start_time) * 1000;
    
    UPDATE musicbrainz_audit_logs 
    SET status = 'FAILED', 
        error_message = 'Rapper not found',
        execution_time_ms = execution_time
    WHERE id = audit_id;
    
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Rapper not found'
    );
  END IF;

  -- Mark as requiring external API call (edge function will handle the actual MusicBrainz API)
  execution_time := EXTRACT(epoch FROM clock_timestamp() - start_time) * 1000;
  
  UPDATE musicbrainz_audit_logs 
  SET status = 'REQUIRES_EXTERNAL_API',
      execution_time_ms = execution_time
  WHERE id = audit_id;

  RETURN jsonb_build_object(
    'success', true,
    'requires_external_api', true,
    'audit_id', audit_id
  );
END;
$$;

-- Fix search path for rate limiting function
CREATE OR REPLACE FUNCTION public.check_musicbrainz_rate_limit(
  p_user_id uuid DEFAULT auth.uid(),
  p_ip_address inet DEFAULT NULL,
  p_max_requests integer DEFAULT 10,
  p_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  window_start timestamp := now() - (p_window_minutes || ' minutes')::interval;
  current_count integer := 0;
BEGIN
  -- Clean up old records
  DELETE FROM musicbrainz_rate_limits 
  WHERE window_start < window_start;
  
  -- Check current request count
  SELECT COALESCE(SUM(request_count), 0) INTO current_count
  FROM musicbrainz_rate_limits
  WHERE (user_id = p_user_id OR ip_address = p_ip_address)
    AND window_start >= window_start;
  
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
$$;