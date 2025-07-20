-- Security fixes for database functions
-- Add proper search_path settings to prevent schema poisoning attacks

-- Fix reset_all_voting_data function
CREATE OR REPLACE FUNCTION public.reset_all_voting_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  votes_deleted INTEGER;
  ranking_votes_deleted INTEGER;
  daily_tracking_deleted INTEGER;
  vote_notes_deleted INTEGER;
  position_history_deleted INTEGER;
  rappers_updated INTEGER;
  member_stats_updated INTEGER;
  result jsonb;
BEGIN
  -- Only allow admins to execute this function
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Start transaction
  BEGIN
    -- Delete votes and count
    DELETE FROM public.votes;
    GET DIAGNOSTICS votes_deleted = ROW_COUNT;

    -- Delete ranking votes and count
    DELETE FROM public.ranking_votes;
    GET DIAGNOSTICS ranking_votes_deleted = ROW_COUNT;

    -- Delete daily vote tracking and count
    DELETE FROM public.daily_vote_tracking;
    GET DIAGNOSTICS daily_tracking_deleted = ROW_COUNT;

    -- Delete vote notes and count
    DELETE FROM public.vote_notes;
    GET DIAGNOSTICS vote_notes_deleted = ROW_COUNT;

    -- Delete ranking position history and count
    DELETE FROM public.ranking_position_history;
    GET DIAGNOSTICS position_history_deleted = ROW_COUNT;

    -- Reset rapper statistics
    UPDATE public.rappers 
    SET 
      total_votes = 0,
      average_rating = 0.00,
      updated_at = NOW();
    GET DIAGNOSTICS rappers_updated = ROW_COUNT;

    -- Reset member statistics
    UPDATE public.member_stats 
    SET 
      total_votes = 0,
      consecutive_voting_days = 0,
      last_vote_date = NULL,
      updated_at = NOW();
    GET DIAGNOSTICS member_stats_updated = ROW_COUNT;

    -- Create result summary
    result := jsonb_build_object(
      'success', true,
      'message', 'All voting data has been successfully reset',
      'details', jsonb_build_object(
        'votes_deleted', votes_deleted,
        'ranking_votes_deleted', ranking_votes_deleted,
        'daily_tracking_deleted', daily_tracking_deleted,
        'vote_notes_deleted', vote_notes_deleted,
        'position_history_deleted', position_history_deleted,
        'rappers_updated', rappers_updated,
        'member_stats_updated', member_stats_updated,
        'reset_timestamp', NOW()
      )
    );

    -- Log the action for audit purposes
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      new_values
    ) VALUES (
      auth.uid(),
      'RESET_ALL_VOTING_DATA',
      'multiple_tables',
      NULL,
      result->'details'
    );

    RETURN result;

  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback is automatic for exceptions in functions
      RAISE EXCEPTION 'Failed to reset voting data: %', SQLERRM;
  END;
END;
$$;

-- Fix other critical security functions with proper search_path
CREATE OR REPLACE FUNCTION public.check_rate_limit(action_type text, user_uuid uuid DEFAULT auth.uid(), max_requests integer DEFAULT 10, window_seconds integer DEFAULT 3600)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  request_count INTEGER;
  window_start TIMESTAMP;
BEGIN
  IF user_uuid IS NULL THEN
    RETURN FALSE;
  END IF;
  
  window_start := NOW() - (window_seconds || ' seconds')::INTERVAL;
  
  -- Count recent requests (this is a simplified version - in production you'd use a proper rate limiting table)
  SELECT COUNT(*) INTO request_count
  FROM public.votes v
  WHERE v.user_id = user_uuid 
    AND v.created_at > window_start
    AND action_type = 'vote';
  
  RETURN request_count < max_requests;
END;
$$;

-- Fix audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only log for authenticated users and sensitive tables
  IF auth.uid() IS NOT NULL AND TG_TABLE_NAME IN ('user_roles', 'blog_posts', 'official_rankings', 'rappers') THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      old_values,
      new_values
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
      CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Fix update ranking activity function
CREATE OR REPLACE FUNCTION public.update_ranking_activity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- Update activity for official rankings when votes are cast
  UPDATE public.official_rankings 
  SET 
    last_activity_at = NEW.created_at,
    activity_score = activity_score + 1
  WHERE id IN (
    SELECT ri.ranking_id 
    FROM public.ranking_items ri 
    WHERE ri.rapper_id = NEW.rapper_id
  );
  
  RETURN NEW;
END;
$$;