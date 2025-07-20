
-- Create a comprehensive function to reset all voting data
CREATE OR REPLACE FUNCTION public.reset_all_voting_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Grant execute permission to authenticated users (function handles admin check internally)
GRANT EXECUTE ON FUNCTION public.reset_all_voting_data() TO authenticated;
