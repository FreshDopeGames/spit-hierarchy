-- Step 1: Add new fields to achievements table
ALTER TABLE public.achievements
ADD COLUMN IF NOT EXISTS series_name TEXT,
ADD COLUMN IF NOT EXISTS tier_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS next_tier_id UUID REFERENCES public.achievements(id),
ADD COLUMN IF NOT EXISTS badge_color TEXT DEFAULT '#6B7280',
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;

-- Step 2: Add new tracking fields to member_stats table
ALTER TABLE public.member_stats
ADD COLUMN IF NOT EXISTS rappers_voted_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS votes_with_notes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referrals_count INTEGER DEFAULT 0;

-- Step 3: Update calculate_member_status function with new thresholds
CREATE OR REPLACE FUNCTION public.calculate_member_status(total_points integer)
RETURNS member_status
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF total_points >= 3000 THEN
    RETURN 'diamond'::public.member_status;
  ELSIF total_points >= 1500 THEN
    RETURN 'platinum'::public.member_status;
  ELSIF total_points >= 750 THEN
    RETURN 'gold'::public.member_status;
  ELSIF total_points >= 250 THEN
    RETURN 'silver'::public.member_status;
  ELSE
    RETURN 'bronze'::public.member_status;
  END IF;
END;
$$;

-- Step 4: Clear existing achievements to start fresh with new system
DELETE FROM public.user_achievements;
DELETE FROM public.achievements;

-- Step 5: Insert Vote Master Series (11 achievements)
WITH vote_master_series AS (
  INSERT INTO public.achievements (name, description, icon, type, rarity, points, threshold_value, threshold_field, series_name, tier_level, badge_color, is_active)
  VALUES
    ('First Vote', 'Cast your first vote on a rapper', '🗳️', 'voting', 'common', 5, 1, 'total_votes', 'Vote Master', 1, '#10b981', true),
    ('Vote Apprentice', 'Cast 5 votes', '🎯', 'voting', 'common', 10, 5, 'total_votes', 'Vote Master', 2, '#10b981', true),
    ('Vote Enthusiast', 'Cast 10 votes', '⚡', 'voting', 'common', 20, 10, 'total_votes', 'Vote Master', 3, '#10b981', true),
    ('Vote Contributor', 'Cast 25 votes', '📊', 'voting', 'common', 35, 25, 'total_votes', 'Vote Master', 4, '#10b981', true),
    ('Vote Specialist', 'Cast 50 votes', '🔥', 'voting', 'rare', 50, 50, 'total_votes', 'Vote Master', 5, '#3b82f6', true),
    ('Vote Expert', 'Cast 100 votes', '💪', 'voting', 'rare', 75, 100, 'total_votes', 'Vote Master', 6, '#3b82f6', true),
    ('Vote Professional', 'Cast 250 votes', '🌟', 'voting', 'rare', 125, 250, 'total_votes', 'Vote Master', 7, '#3b82f6', true),
    ('Vote Master', 'Cast 500 votes', '👑', 'voting', 'epic', 200, 500, 'total_votes', 'Vote Master', 8, '#8b5cf6', true),
    ('Vote Champion', 'Cast 1,000 votes', '🏆', 'voting', 'epic', 350, 1000, 'total_votes', 'Vote Master', 9, '#8b5cf6', true),
    ('Vote Legend', 'Cast 2,500 votes', '💎', 'voting', 'legendary', 600, 2500, 'total_votes', 'Vote Master', 10, '#f59e0b', true),
    ('Vote Immortal', 'Cast 5,000 votes', '⚡👑', 'voting', 'legendary', 1000, 5000, 'total_votes', 'Vote Master', 11, '#f59e0b', true)
  RETURNING id, tier_level
)
UPDATE public.achievements a
SET next_tier_id = (
  SELECT id FROM vote_master_series WHERE tier_level = a.tier_level + 1
)
FROM vote_master_series vms
WHERE a.id = vms.id AND a.series_name = 'Vote Master';

-- Step 6: Insert Consistency King Series (9 achievements)
WITH consistency_series AS (
  INSERT INTO public.achievements (name, description, icon, type, rarity, points, threshold_value, threshold_field, series_name, tier_level, badge_color, is_active)
  VALUES
    ('First Streak', 'Vote for 2 consecutive days', '🔗', 'time_based', 'common', 10, 2, 'consecutive_voting_days', 'Consistency King', 1, '#10b981', true),
    ('Weekend Warrior', 'Vote for 3 consecutive days', '💪', 'time_based', 'common', 15, 3, 'consecutive_voting_days', 'Consistency King', 2, '#10b981', true),
    ('Work Week', 'Vote for 5 consecutive days', '📅', 'time_based', 'common', 25, 5, 'consecutive_voting_days', 'Consistency King', 3, '#10b981', true),
    ('Week Warrior', 'Vote for 7 consecutive days', '🌟', 'time_based', 'rare', 50, 7, 'consecutive_voting_days', 'Consistency King', 4, '#3b82f6', true),
    ('Two Week Streak', 'Vote for 14 consecutive days', '🔥', 'time_based', 'rare', 75, 14, 'consecutive_voting_days', 'Consistency King', 5, '#3b82f6', true),
    ('Month Master', 'Vote for 30 consecutive days', '📆', 'time_based', 'epic', 150, 30, 'consecutive_voting_days', 'Consistency King', 6, '#8b5cf6', true),
    ('Quarter Champion', 'Vote for 90 consecutive days', '💎', 'time_based', 'epic', 400, 90, 'consecutive_voting_days', 'Consistency King', 7, '#8b5cf6', true),
    ('Streak Legend', 'Vote for 180 consecutive days', '👑', 'time_based', 'legendary', 800, 180, 'consecutive_voting_days', 'Consistency King', 8, '#f59e0b', true),
    ('Year of Dedication', 'Vote for 365 consecutive days', '⚡👑', 'time_based', 'legendary', 1500, 365, 'consecutive_voting_days', 'Consistency King', 9, '#f59e0b', true)
  RETURNING id, tier_level
)
UPDATE public.achievements a
SET next_tier_id = (
  SELECT id FROM consistency_series WHERE tier_level = a.tier_level + 1
)
FROM consistency_series cs
WHERE a.id = cs.id AND a.series_name = 'Consistency King';

-- Step 7: Insert Community Voice Series (9 achievements)
WITH community_voice_series AS (
  INSERT INTO public.achievements (name, description, icon, type, rarity, points, threshold_value, threshold_field, series_name, tier_level, badge_color, is_active)
  VALUES
    ('First Comment', 'Post your first comment', '💬', 'community', 'common', 5, 1, 'total_comments', 'Community Voice', 1, '#10b981', true),
    ('Getting Chatty', 'Post 5 comments', '🗣️', 'community', 'common', 15, 5, 'total_comments', 'Community Voice', 2, '#10b981', true),
    ('Conversationalist', 'Post 10 comments', '💭', 'community', 'common', 25, 10, 'total_comments', 'Community Voice', 3, '#10b981', true),
    ('Discussion Starter', 'Post 25 comments', '🎤', 'community', 'rare', 40, 25, 'total_comments', 'Community Voice', 4, '#3b82f6', true),
    ('Community Voice', 'Post 50 comments', '📢', 'community', 'rare', 65, 50, 'total_comments', 'Community Voice', 5, '#3b82f6', true),
    ('Discussion Leader', 'Post 100 comments', '🌟', 'community', 'rare', 100, 100, 'total_comments', 'Community Voice', 6, '#3b82f6', true),
    ('Forum Expert', 'Post 250 comments', '👥', 'community', 'epic', 175, 250, 'total_comments', 'Community Voice', 7, '#8b5cf6', true),
    ('Community Pillar', 'Post 500 comments', '🏛️', 'community', 'epic', 300, 500, 'total_comments', 'Community Voice', 8, '#8b5cf6', true),
    ('Discussion Legend', 'Post 1,000 comments', '👑', 'community', 'legendary', 500, 1000, 'total_comments', 'Community Voice', 9, '#f59e0b', true)
  RETURNING id, tier_level
)
UPDATE public.achievements a
SET next_tier_id = (
  SELECT id FROM community_voice_series WHERE tier_level = a.tier_level + 1
)
FROM community_voice_series cvs
WHERE a.id = cvs.id AND a.series_name = 'Community Voice';

-- Step 8: Insert Upvote Champion Series (8 achievements)
WITH upvote_series AS (
  INSERT INTO public.achievements (name, description, icon, type, rarity, points, threshold_value, threshold_field, series_name, tier_level, badge_color, is_active)
  VALUES
    ('First Like', 'Receive your first upvote', '👍', 'engagement', 'common', 5, 1, 'total_upvotes', 'Upvote Champion', 1, '#10b981', true),
    ('Rising Voice', 'Receive 5 upvotes', '📈', 'engagement', 'common', 15, 5, 'total_upvotes', 'Upvote Champion', 2, '#10b981', true),
    ('Popular Voice', 'Receive 10 upvotes', '⭐', 'engagement', 'rare', 30, 10, 'total_upvotes', 'Upvote Champion', 3, '#3b82f6', true),
    ('Respected Voice', 'Receive 25 upvotes', '🎖️', 'engagement', 'rare', 50, 25, 'total_upvotes', 'Upvote Champion', 4, '#3b82f6', true),
    ('Community Favorite', 'Receive 50 upvotes', '💝', 'engagement', 'rare', 85, 50, 'total_upvotes', 'Upvote Champion', 5, '#3b82f6', true),
    ('Influencer', 'Receive 100 upvotes', '✨', 'engagement', 'epic', 150, 100, 'total_upvotes', 'Upvote Champion', 6, '#8b5cf6', true),
    ('Community Icon', 'Receive 250 upvotes', '🌟', 'engagement', 'epic', 300, 250, 'total_upvotes', 'Upvote Champion', 7, '#8b5cf6', true),
    ('Legendary Voice', 'Receive 500 upvotes', '👑', 'engagement', 'legendary', 500, 500, 'total_upvotes', 'Upvote Champion', 8, '#f59e0b', true)
  RETURNING id, tier_level
)
UPDATE public.achievements a
SET next_tier_id = (
  SELECT id FROM upvote_series WHERE tier_level = a.tier_level + 1
)
FROM upvote_series us
WHERE a.id = us.id AND a.series_name = 'Upvote Champion';

-- Step 9: Insert Ranking Curator Series (6 achievements)
WITH ranking_curator_series AS (
  INSERT INTO public.achievements (name, description, icon, type, rarity, points, threshold_value, threshold_field, series_name, tier_level, badge_color, is_active)
  VALUES
    ('First List', 'Create your first ranking list', '📝', 'quality', 'common', 25, 1, 'ranking_lists_created', 'Ranking Curator', 1, '#10b981', true),
    ('List Creator', 'Create 3 ranking lists', '📋', 'quality', 'common', 40, 3, 'ranking_lists_created', 'Ranking Curator', 2, '#10b981', true),
    ('Ranking Enthusiast', 'Create 5 ranking lists', '⭐', 'quality', 'rare', 60, 5, 'ranking_lists_created', 'Ranking Curator', 3, '#3b82f6', true),
    ('Ranking Expert', 'Create 10 ranking lists', '🌟', 'quality', 'rare', 100, 10, 'ranking_lists_created', 'Ranking Curator', 4, '#3b82f6', true),
    ('Ranking Master', 'Create 25 ranking lists', '👑', 'quality', 'epic', 200, 25, 'ranking_lists_created', 'Ranking Curator', 5, '#8b5cf6', true),
    ('Ranking Legend', 'Create 50 ranking lists', '💎', 'quality', 'legendary', 400, 50, 'ranking_lists_created', 'Ranking Curator', 6, '#f59e0b', true)
  RETURNING id, tier_level
)
UPDATE public.achievements a
SET next_tier_id = (
  SELECT id FROM ranking_curator_series WHERE tier_level = a.tier_level + 1
)
FROM ranking_curator_series rcs
WHERE a.id = rcs.id AND a.series_name = 'Ranking Curator';

-- Step 10: Insert Top Five Series (3 achievements)
INSERT INTO public.achievements (name, description, icon, type, rarity, points, threshold_value, threshold_field, series_name, tier_level, badge_color, is_active)
VALUES
  ('Top 5 Creator', 'Create your Top 5 rappers list', '🎯', 'quality', 'common', 25, 1, 'top_five_created', 'Top Five', 1, '#10b981', true),
  ('Curated Taste', 'Update your Top 5 list', '✨', 'quality', 'common', 15, 1, 'top_five_created', 'Top Five', 2, '#10b981', true),
  ('Top 5 Expert', 'Maintain Top 5 for 30 days', '🏆', 'quality', 'rare', 50, 1, 'top_five_created', 'Top Five', 3, '#3b82f6', true);

-- Step 11: Insert Rapper Connoisseur Series (8 achievements)
WITH rapper_connoisseur_series AS (
  INSERT INTO public.achievements (name, description, icon, type, rarity, points, threshold_value, threshold_field, series_name, tier_level, badge_color, is_active)
  VALUES
    ('First Rating', 'Vote on your first rapper', '🎤', 'voting', 'common', 5, 1, 'rappers_voted_count', 'Rapper Connoisseur', 1, '#10b981', true),
    ('Exploring Talent', 'Vote on 5 different rappers', '🔍', 'voting', 'common', 15, 5, 'rappers_voted_count', 'Rapper Connoisseur', 2, '#10b981', true),
    ('Diverse Voter', 'Vote on 10 different rappers', '🎧', 'voting', 'common', 25, 10, 'rappers_voted_count', 'Rapper Connoisseur', 3, '#10b981', true),
    ('Hip Hop Scholar', 'Vote on 25 different rappers', '📚', 'voting', 'rare', 50, 25, 'rappers_voted_count', 'Rapper Connoisseur', 4, '#3b82f6', true),
    ('Rap Encyclopedia', 'Vote on 50 different rappers', '📖', 'voting', 'rare', 85, 50, 'rappers_voted_count', 'Rapper Connoisseur', 5, '#3b82f6', true),
    ('Genre Expert', 'Vote on 100 different rappers', '🎓', 'voting', 'epic', 150, 100, 'rappers_voted_count', 'Rapper Connoisseur', 6, '#8b5cf6', true),
    ('Rap Historian', 'Vote on 250 different rappers', '📜', 'voting', 'epic', 300, 250, 'rappers_voted_count', 'Rapper Connoisseur', 7, '#8b5cf6', true),
    ('Complete Authority', 'Vote on 500 different rappers', '👑', 'voting', 'legendary', 600, 500, 'rappers_voted_count', 'Rapper Connoisseur', 8, '#f59e0b', true)
  RETURNING id, tier_level
)
UPDATE public.achievements a
SET next_tier_id = (
  SELECT id FROM rapper_connoisseur_series WHERE tier_level = a.tier_level + 1
)
FROM rapper_connoisseur_series rcs
WHERE a.id = rcs.id AND a.series_name = 'Rapper Connoisseur';

-- Step 12: Insert Detailed Critic Series (5 achievements)
WITH detailed_critic_series AS (
  INSERT INTO public.achievements (name, description, icon, type, rarity, points, threshold_value, threshold_field, series_name, tier_level, badge_color, is_active)
  VALUES
    ('First Note', 'Add a note to your vote', '📝', 'quality', 'common', 10, 1, 'votes_with_notes_count', 'Detailed Critic', 1, '#10b981', true),
    ('Thoughtful Voter', 'Add notes to 10 votes', '💭', 'quality', 'common', 25, 10, 'votes_with_notes_count', 'Detailed Critic', 2, '#10b981', true),
    ('Detailed Critic', 'Add notes to 25 votes', '✍️', 'quality', 'rare', 50, 25, 'votes_with_notes_count', 'Detailed Critic', 3, '#3b82f6', true),
    ('Analysis Expert', 'Add notes to 50 votes', '🔬', 'quality', 'rare', 100, 50, 'votes_with_notes_count', 'Detailed Critic', 4, '#3b82f6', true),
    ('Review Master', 'Add notes to 100 votes', '👑', 'quality', 'epic', 200, 100, 'votes_with_notes_count', 'Detailed Critic', 5, '#8b5cf6', true)
  RETURNING id, tier_level
)
UPDATE public.achievements a
SET next_tier_id = (
  SELECT id FROM detailed_critic_series WHERE tier_level = a.tier_level + 1
)
FROM detailed_critic_series dcs
WHERE a.id = dcs.id AND a.series_name = 'Detailed Critic';

-- Step 13: Insert Account Milestone achievements
INSERT INTO public.achievements (name, description, icon, type, rarity, points, threshold_value, threshold_field, series_name, tier_level, badge_color, is_active)
VALUES
  ('Welcome', 'Join the community', '👋', 'special', 'common', 5, 0, NULL, 'Account Milestone', 1, '#10b981', true),
  ('Early Adopter', 'Join in the first year', '🚀', 'special', 'epic', 250, 0, NULL, 'Account Milestone', 2, '#8b5cf6', true),
  ('Beta Tester', 'Participate in beta testing', '🧪', 'special', 'epic', 100, 0, NULL, 'Account Milestone', 3, '#8b5cf6', true);

-- Step 14: Insert Discovery achievements
INSERT INTO public.achievements (name, description, icon, type, rarity, points, threshold_value, threshold_field, series_name, tier_level, badge_color, is_active)
VALUES
  ('Explorer', 'View 10 rapper profiles', '🗺️', 'engagement', 'common', 10, 10, 'profile_views_count', 'Discovery', 1, '#10b981', true),
  ('Deep Diver', 'View 50 rapper profiles', '🏊', 'engagement', 'rare', 30, 50, 'profile_views_count', 'Discovery', 2, '#3b82f6', true),
  ('Researcher', 'View 100 rapper profiles', '🔬', 'engagement', 'rare', 60, 100, 'profile_views_count', 'Discovery', 3, '#3b82f6', true);

-- Step 15: Insert Community Building achievements
INSERT INTO public.achievements (name, description, icon, type, rarity, points, threshold_value, threshold_field, series_name, tier_level, badge_color, is_active)
VALUES
  ('Newcomer Guide', 'Refer your first user', '🤝', 'community', 'rare', 50, 1, 'referrals_count', 'Community Builder', 1, '#3b82f6', true),
  ('Community Builder', 'Refer 5 users', '🏗️', 'community', 'epic', 150, 5, 'referrals_count', 'Community Builder', 2, '#8b5cf6', true),
  ('Influencer', 'Refer 10 users', '🌟', 'community', 'legendary', 400, 10, 'referrals_count', 'Community Builder', 3, '#f59e0b', true);

-- Step 16: Create index for achievement series queries
CREATE INDEX IF NOT EXISTS idx_achievements_series_tier ON public.achievements(series_name, tier_level);
CREATE INDEX IF NOT EXISTS idx_achievements_next_tier ON public.achievements(next_tier_id);

-- Step 17: Update check_and_award_achievements function to handle new fields
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  achievement_record RECORD;
  user_stats_record RECORD;
  current_value integer;
BEGIN
  -- Get user stats
  SELECT * INTO user_stats_record 
  FROM public.member_stats 
  WHERE id = target_user_id;
  
  IF user_stats_record IS NULL THEN
    RETURN;
  END IF;
  
  -- Loop through all active achievements
  FOR achievement_record IN 
    SELECT * FROM public.achievements 
    WHERE is_active = true 
    AND id NOT IN (
      SELECT achievement_id 
      FROM public.user_achievements 
      WHERE user_id = target_user_id
    )
  LOOP
    current_value := 0;
    
    -- Check threshold based on field
    CASE achievement_record.threshold_field
      WHEN 'total_votes' THEN
        current_value := user_stats_record.total_votes;
      WHEN 'consecutive_voting_days' THEN
        current_value := user_stats_record.consecutive_voting_days;
      WHEN 'total_comments' THEN
        current_value := user_stats_record.total_comments;
      WHEN 'ranking_lists_created' THEN
        current_value := user_stats_record.ranking_lists_created;
      WHEN 'total_upvotes' THEN
        current_value := user_stats_record.total_upvotes;
      WHEN 'top_five_created' THEN
        current_value := user_stats_record.top_five_created;
      WHEN 'rappers_voted_count' THEN
        current_value := user_stats_record.rappers_voted_count;
      WHEN 'votes_with_notes_count' THEN
        current_value := user_stats_record.votes_with_notes_count;
      WHEN 'profile_views_count' THEN
        current_value := user_stats_record.profile_views_count;
      WHEN 'referrals_count' THEN
        current_value := user_stats_record.referrals_count;
      ELSE
        -- Handle special achievements without thresholds (e.g., Welcome)
        IF achievement_record.threshold_field IS NULL THEN
          current_value := achievement_record.threshold_value;
        ELSE
          CONTINUE;
        END IF;
    END CASE;
    
    -- Award achievement if threshold is met
    IF current_value >= achievement_record.threshold_value THEN
      INSERT INTO public.user_achievements (user_id, achievement_id, progress_value)
      VALUES (target_user_id, achievement_record.id, current_value)
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$function$;