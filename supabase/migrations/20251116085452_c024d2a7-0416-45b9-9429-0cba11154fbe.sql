-- First, clean up existing orphan tracking records
DELETE FROM public.daily_vote_tracking
WHERE vote_date >= CURRENT_DATE - INTERVAL '7 days'
  AND NOT EXISTS (
    SELECT 1 FROM public.ranking_votes
    WHERE ranking_votes.user_id = daily_vote_tracking.user_id
      AND ranking_votes.ranking_id = daily_vote_tracking.ranking_id
      AND ranking_votes.rapper_id = daily_vote_tracking.rapper_id
      AND ranking_votes.vote_date = daily_vote_tracking.vote_date
  );

-- Update vote_official function with proper duplicate checking and self-healing
CREATE OR REPLACE FUNCTION public.vote_official(
  p_ranking_id uuid, 
  p_rapper_id uuid, 
  p_member_status member_status
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_vote_weight integer;
  v_vote_id uuid;
  v_today date;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED';
  END IF;
  
  -- Validate inputs
  IF p_ranking_id IS NULL OR p_rapper_id IS NULL THEN
    RAISE EXCEPTION 'INVALID_PARAMS';
  END IF;
  
  -- Verify rapper exists
  IF NOT EXISTS (SELECT 1 FROM public.rappers WHERE id = p_rapper_id) THEN
    RAISE EXCEPTION 'RAPPER_NOT_FOUND';
  END IF;
  
  -- Verify ranking exists
  IF NOT EXISTS (SELECT 1 FROM public.official_rankings WHERE id = p_ranking_id) THEN
    RAISE EXCEPTION 'RANKING_NOT_FOUND';
  END IF;
  
  -- Get vote weight for member status
  v_vote_weight := public.get_vote_weight(p_member_status);
  
  -- Check current date
  v_today := CURRENT_DATE;
  
  -- Check for duplicate vote in actual votes table (SOURCE OF TRUTH)
  IF EXISTS (
    SELECT 1 FROM public.ranking_votes
    WHERE user_id = v_user_id
      AND ranking_id = p_ranking_id
      AND rapper_id = p_rapper_id
      AND vote_date = v_today
  ) THEN
    RAISE EXCEPTION 'ALREADY_VOTED_TODAY';
  END IF;
  
  -- Clean up any orphan tracking records (self-heal)
  DELETE FROM public.daily_vote_tracking
  WHERE user_id = v_user_id
    AND ranking_id = p_ranking_id
    AND rapper_id = p_rapper_id
    AND vote_date = v_today;
  
  -- Insert the vote
  INSERT INTO public.ranking_votes (
    user_id,
    ranking_id,
    rapper_id,
    vote_weight,
    member_status,
    vote_date,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    p_ranking_id,
    p_rapper_id,
    v_vote_weight,
    p_member_status,
    v_today,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_vote_id;
  
  -- Insert into daily vote tracking (best-effort, don't fail vote if this fails)
  BEGIN
    INSERT INTO public.daily_vote_tracking (
      user_id,
      ranking_id,
      user_ranking_id,
      rapper_id,
      vote_date
    ) VALUES (
      v_user_id,
      p_ranking_id,
      NULL,
      p_rapper_id,
      v_today
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log but don't fail the vote
    RAISE WARNING 'Tracking insert failed: %', SQLERRM;
  END;
  
  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'vote_id', v_vote_id,
    'ranking_id', p_ranking_id
  );
END;
$function$;