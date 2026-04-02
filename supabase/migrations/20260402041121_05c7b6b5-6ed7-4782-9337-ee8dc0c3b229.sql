
-- Create save_onboarding_username RPC
CREATE OR REPLACE FUNCTION public.save_onboarding_username(p_username text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO profiles (id, username, username_last_changed_at)
  VALUES (auth.uid(), p_username, now())
  ON CONFLICT (id) DO UPDATE
    SET username = EXCLUDED.username,
        username_last_changed_at = EXCLUDED.username_last_changed_at;

  INSERT INTO member_stats (id, top_five_created, updated_at)
  VALUES (auth.uid(), 1, now())
  ON CONFLICT (id) DO UPDATE
    SET top_five_created = GREATEST(member_stats.top_five_created, 1),
        updated_at = now();
END;
$$;

-- Fix the trigger to not crash on achievement errors
CREATE OR REPLACE FUNCTION update_member_stats_on_top_five()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.member_stats (id, top_five_created, updated_at)
  VALUES (NEW.user_id, 1, NOW())
  ON CONFLICT (id) 
  DO UPDATE SET 
    top_five_created = GREATEST(public.member_stats.top_five_created, 1),
    updated_at = NOW();
  
  BEGIN
    PERFORM public.check_and_award_achievements(NEW.user_id);
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Achievement check failed for user %: %', NEW.user_id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;
