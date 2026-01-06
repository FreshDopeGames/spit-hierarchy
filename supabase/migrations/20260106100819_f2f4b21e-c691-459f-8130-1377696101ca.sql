-- Create Session Warrior achievement series
INSERT INTO public.achievements (name, description, icon, type, rarity, points, threshold_field, threshold_value, series_name, tier_level, is_active)
VALUES
  ('First Session', 'Started your first session on Spit Hierarchy', 'LogIn', 'engagement', 'common', 5, 'session_count', 1, 'Session Warrior', 1, true),
  ('Regular Visitor', 'Returned for 10 sessions', 'Calendar', 'engagement', 'common', 15, 'session_count', 10, 'Session Warrior', 2, true),
  ('Returning Fan', 'Came back for 25 sessions', 'Heart', 'engagement', 'common', 25, 'session_count', 25, 'Session Warrior', 3, true),
  ('Dedicated Member', 'Logged 50 sessions', 'Star', 'engagement', 'rare', 50, 'session_count', 50, 'Session Warrior', 4, true),
  ('Session Veteran', 'Reached 100 sessions', 'Award', 'engagement', 'rare', 100, 'session_count', 100, 'Session Warrior', 5, true),
  ('True Devotee', 'Achieved 250 sessions', 'Crown', 'engagement', 'epic', 200, 'session_count', 250, 'Session Warrior', 6, true),
  ('Session Legend', 'Completed 500 sessions', 'Trophy', 'engagement', 'epic', 400, 'session_count', 500, 'Session Warrior', 7, true),
  ('Eternal Supporter', 'Reached 1000 sessions', 'Gem', 'engagement', 'legendary', 750, 'session_count', 1000, 'Session Warrior', 8, true);

-- Create increment_session_count RPC function
CREATE OR REPLACE FUNCTION public.increment_session_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  INSERT INTO public.member_stats (id, session_count, updated_at)
  VALUES (auth.uid(), 1, NOW())
  ON CONFLICT (id) 
  DO UPDATE SET 
    session_count = member_stats.session_count + 1,
    updated_at = NOW()
  RETURNING session_count INTO new_count;
  
  -- Check for any new achievements
  PERFORM public.check_and_award_achievements(auth.uid());
  
  RETURN new_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.increment_session_count() TO authenticated;