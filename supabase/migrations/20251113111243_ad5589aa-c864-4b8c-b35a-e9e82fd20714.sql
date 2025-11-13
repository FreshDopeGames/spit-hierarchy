-- Create atomic vote submission function for official rankings
CREATE OR REPLACE FUNCTION public.vote_official(
  p_ranking_id uuid,
  p_rapper_id uuid,
  p_member_status public.member_status
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
  
  -- Check for duplicate vote today
  v_today := CURRENT_DATE;
  
  IF EXISTS (
    SELECT 1 FROM public.daily_vote_tracking
    WHERE user_id = v_user_id
      AND rapper_id = p_rapper_id
      AND ranking_id = p_ranking_id
      AND vote_date = v_today
  ) THEN
    RAISE EXCEPTION 'ALREADY_VOTED_TODAY';
  END IF;
  
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
  
  -- Insert into daily vote tracking
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
  
  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'vote_id', v_vote_id,
    'ranking_id', p_ranking_id
  );
END;
$function$;