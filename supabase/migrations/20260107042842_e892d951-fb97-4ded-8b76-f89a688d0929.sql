-- Rebalance Achievement Economy for Long-Term Engagement
-- Target: Diamond status achievable in ~1 year for consistent users

-- Step 1: Update calculate_member_status function with new thresholds
CREATE OR REPLACE FUNCTION public.calculate_member_status(total_points integer)
RETURNS public.member_status
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF total_points >= 7000 THEN
    RETURN 'diamond'::public.member_status;
  ELSIF total_points >= 3500 THEN
    RETURN 'platinum'::public.member_status;
  ELSIF total_points >= 1500 THEN
    RETURN 'gold'::public.member_status;
  ELSIF total_points >= 500 THEN
    RETURN 'silver'::public.member_status;
  ELSE
    RETURN 'bronze'::public.member_status;
  END IF;
END;
$$;

-- Step 2: Rebalance Session Warrior Series (scaled up ~2.5-3x)
UPDATE public.achievements SET points = 10 WHERE series_name = 'Session Warrior' AND tier_level = 1;
UPDATE public.achievements SET points = 35 WHERE series_name = 'Session Warrior' AND tier_level = 2;
UPDATE public.achievements SET points = 60 WHERE series_name = 'Session Warrior' AND tier_level = 3;
UPDATE public.achievements SET points = 125 WHERE series_name = 'Session Warrior' AND tier_level = 4;
UPDATE public.achievements SET points = 250 WHERE series_name = 'Session Warrior' AND tier_level = 5;
UPDATE public.achievements SET points = 500 WHERE series_name = 'Session Warrior' AND tier_level = 6;
UPDATE public.achievements SET points = 1000 WHERE series_name = 'Session Warrior' AND tier_level = 7;
UPDATE public.achievements SET points = 2000 WHERE series_name = 'Session Warrior' AND tier_level = 8;

-- Step 3: Rebalance Vote Master Series (scaled up ~2.5x)
UPDATE public.achievements SET points = 10 WHERE series_name = 'Vote Master' AND tier_level = 1;
UPDATE public.achievements SET points = 25 WHERE series_name = 'Vote Master' AND tier_level = 2;
UPDATE public.achievements SET points = 50 WHERE series_name = 'Vote Master' AND tier_level = 3;
UPDATE public.achievements SET points = 85 WHERE series_name = 'Vote Master' AND tier_level = 4;
UPDATE public.achievements SET points = 125 WHERE series_name = 'Vote Master' AND tier_level = 5;
UPDATE public.achievements SET points = 185 WHERE series_name = 'Vote Master' AND tier_level = 6;
UPDATE public.achievements SET points = 300 WHERE series_name = 'Vote Master' AND tier_level = 7;
UPDATE public.achievements SET points = 500 WHERE series_name = 'Vote Master' AND tier_level = 8;
UPDATE public.achievements SET points = 850 WHERE series_name = 'Vote Master' AND tier_level = 9;
UPDATE public.achievements SET points = 1500 WHERE series_name = 'Vote Master' AND tier_level = 10;
UPDATE public.achievements SET points = 2500 WHERE series_name = 'Vote Master' AND tier_level = 11;

-- Step 4: Rebalance Consistency King Series (scaled up significantly for long-term)
UPDATE public.achievements SET points = 25 WHERE series_name = 'Consistency King' AND tier_level = 1;
UPDATE public.achievements SET points = 40 WHERE series_name = 'Consistency King' AND tier_level = 2;
UPDATE public.achievements SET points = 65 WHERE series_name = 'Consistency King' AND tier_level = 3;
UPDATE public.achievements SET points = 125 WHERE series_name = 'Consistency King' AND tier_level = 4;
UPDATE public.achievements SET points = 200 WHERE series_name = 'Consistency King' AND tier_level = 5;
UPDATE public.achievements SET points = 400 WHERE series_name = 'Consistency King' AND tier_level = 6;
UPDATE public.achievements SET points = 1000 WHERE series_name = 'Consistency King' AND tier_level = 7;
UPDATE public.achievements SET points = 2000 WHERE series_name = 'Consistency King' AND tier_level = 8;
UPDATE public.achievements SET points = 4000 WHERE series_name = 'Consistency King' AND tier_level = 9;

-- Step 5: Rebalance Community Voice Series (scaled up ~2x)
UPDATE public.achievements SET points = 10 WHERE series_name = 'Community Voice' AND tier_level = 1;
UPDATE public.achievements SET points = 30 WHERE series_name = 'Community Voice' AND tier_level = 2;
UPDATE public.achievements SET points = 50 WHERE series_name = 'Community Voice' AND tier_level = 3;
UPDATE public.achievements SET points = 80 WHERE series_name = 'Community Voice' AND tier_level = 4;
UPDATE public.achievements SET points = 130 WHERE series_name = 'Community Voice' AND tier_level = 5;
UPDATE public.achievements SET points = 200 WHERE series_name = 'Community Voice' AND tier_level = 6;
UPDATE public.achievements SET points = 350 WHERE series_name = 'Community Voice' AND tier_level = 7;
UPDATE public.achievements SET points = 600 WHERE series_name = 'Community Voice' AND tier_level = 8;
UPDATE public.achievements SET points = 1000 WHERE series_name = 'Community Voice' AND tier_level = 9;

-- Step 6: Rebalance Upvote Champion Series (scaled up ~2x)
UPDATE public.achievements SET points = 10 WHERE series_name = 'Upvote Champion' AND tier_level = 1;
UPDATE public.achievements SET points = 25 WHERE series_name = 'Upvote Champion' AND tier_level = 2;
UPDATE public.achievements SET points = 50 WHERE series_name = 'Upvote Champion' AND tier_level = 3;
UPDATE public.achievements SET points = 100 WHERE series_name = 'Upvote Champion' AND tier_level = 4;
UPDATE public.achievements SET points = 175 WHERE series_name = 'Upvote Champion' AND tier_level = 5;
UPDATE public.achievements SET points = 300 WHERE series_name = 'Upvote Champion' AND tier_level = 6;
UPDATE public.achievements SET points = 500 WHERE series_name = 'Upvote Champion' AND tier_level = 7;
UPDATE public.achievements SET points = 700 WHERE series_name = 'Upvote Champion' AND tier_level = 8;

-- Step 7: Rebalance Rapper Connoisseur Series (scaled up ~2x)
UPDATE public.achievements SET points = 10 WHERE series_name = 'Rapper Connoisseur' AND tier_level = 1;
UPDATE public.achievements SET points = 25 WHERE series_name = 'Rapper Connoisseur' AND tier_level = 2;
UPDATE public.achievements SET points = 50 WHERE series_name = 'Rapper Connoisseur' AND tier_level = 3;
UPDATE public.achievements SET points = 85 WHERE series_name = 'Rapper Connoisseur' AND tier_level = 4;
UPDATE public.achievements SET points = 150 WHERE series_name = 'Rapper Connoisseur' AND tier_level = 5;
UPDATE public.achievements SET points = 250 WHERE series_name = 'Rapper Connoisseur' AND tier_level = 6;
UPDATE public.achievements SET points = 450 WHERE series_name = 'Rapper Connoisseur' AND tier_level = 7;
UPDATE public.achievements SET points = 800 WHERE series_name = 'Rapper Connoisseur' AND tier_level = 8;

-- Step 8: Rebalance Detailed Critic Series (scaled up ~2x)
UPDATE public.achievements SET points = 20 WHERE series_name = 'Detailed Critic' AND tier_level = 1;
UPDATE public.achievements SET points = 50 WHERE series_name = 'Detailed Critic' AND tier_level = 2;
UPDATE public.achievements SET points = 100 WHERE series_name = 'Detailed Critic' AND tier_level = 3;
UPDATE public.achievements SET points = 200 WHERE series_name = 'Detailed Critic' AND tier_level = 4;
UPDATE public.achievements SET points = 400 WHERE series_name = 'Detailed Critic' AND tier_level = 5;

-- Step 9: Rebalance Ranking Curator Series (scaled up ~2x)
UPDATE public.achievements SET points = 50 WHERE series_name = 'Ranking Curator' AND tier_level = 1;
UPDATE public.achievements SET points = 80 WHERE series_name = 'Ranking Curator' AND tier_level = 2;
UPDATE public.achievements SET points = 120 WHERE series_name = 'Ranking Curator' AND tier_level = 3;
UPDATE public.achievements SET points = 200 WHERE series_name = 'Ranking Curator' AND tier_level = 4;
UPDATE public.achievements SET points = 350 WHERE series_name = 'Ranking Curator' AND tier_level = 5;
UPDATE public.achievements SET points = 600 WHERE series_name = 'Ranking Curator' AND tier_level = 6;

-- Step 10: Rebalance Discovery Series (scaled up ~2x)
UPDATE public.achievements SET points = 20 WHERE series_name = 'Discovery' AND tier_level = 1;
UPDATE public.achievements SET points = 60 WHERE series_name = 'Discovery' AND tier_level = 2;
UPDATE public.achievements SET points = 120 WHERE series_name = 'Discovery' AND tier_level = 3;

-- Step 11: Rebalance Exploration Series (scaled up ~2x)
UPDATE public.achievements SET points = 20 WHERE series_name = 'Exploration' AND tier_level = 1;
UPDATE public.achievements SET points = 30 WHERE series_name = 'Exploration' AND tier_level = 2;
UPDATE public.achievements SET points = 30 WHERE series_name = 'Exploration' AND tier_level = 3;
UPDATE public.achievements SET points = 40 WHERE series_name = 'Exploration' AND tier_level = 4;
UPDATE public.achievements SET points = 50 WHERE series_name = 'Exploration' AND tier_level = 5;
UPDATE public.achievements SET points = 50 WHERE series_name = 'Exploration' AND tier_level = 6;
UPDATE public.achievements SET points = 60 WHERE series_name = 'Exploration' AND tier_level = 7;

-- Step 12: Rebalance Account Milestone Series
UPDATE public.achievements SET points = 10 WHERE series_name = 'Account Milestone' AND name = 'Welcome';
UPDATE public.achievements SET points = 500 WHERE series_name = 'Account Milestone' AND name = 'Early Adopter';
UPDATE public.achievements SET points = 200 WHERE series_name = 'Account Milestone' AND name = 'Beta Tester';

-- Step 13: Recalculate all user statuses based on new achievement point values
UPDATE public.member_stats ms
SET 
  status = public.calculate_member_status(
    COALESCE((
      SELECT SUM(a.points)
      FROM public.user_achievements ua
      JOIN public.achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = ms.id
    ), 0)::integer
  ),
  updated_at = NOW();