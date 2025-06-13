
-- Create enum for achievement types
CREATE TYPE public.achievement_type AS ENUM (
  'voting',
  'engagement', 
  'quality',
  'community',
  'time_based',
  'special'
);

-- Create enum for achievement rarity
CREATE TYPE public.achievement_rarity AS ENUM (
  'common',
  'rare', 
  'epic',
  'legendary'
);

-- Create achievements table to define all available achievements
CREATE TABLE public.achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL, -- Lucide icon name
  type achievement_type NOT NULL,
  rarity achievement_rarity NOT NULL DEFAULT 'common',
  points integer NOT NULL DEFAULT 0,
  threshold_value integer, -- For achievements with numeric thresholds
  threshold_field text, -- Field to check (e.g., 'total_votes', 'consecutive_voting_days')
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_achievements table to track earned achievements
CREATE TABLE public.user_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at timestamp with time zone NOT NULL DEFAULT now(),
  progress_value integer DEFAULT 0, -- Current progress toward achievement
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS on both tables
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS policies for achievements (public readable)
CREATE POLICY "Everyone can view achievements" 
  ON public.achievements 
  FOR SELECT 
  USING (is_active = true);

-- RLS policies for user_achievements
CREATE POLICY "Users can view their own achievements" 
  ON public.user_achievements 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" 
  ON public.user_achievements 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create function to check and award achievements
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
      ELSE
        -- Handle special achievements that don't use simple thresholds
        CONTINUE;
    END CASE;
    
    -- Award achievement if threshold is met
    IF current_value >= achievement_record.threshold_value THEN
      INSERT INTO public.user_achievements (user_id, achievement_id, progress_value)
      VALUES (target_user_id, achievement_record.id, current_value)
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$$;

-- Insert initial achievements
INSERT INTO public.achievements (name, description, icon, type, rarity, points, threshold_value, threshold_field) VALUES
-- Voting achievements
('First Vote', 'Cast your first vote for a rapper', 'vote', 'voting', 'common', 10, 1, 'total_votes'),
('Getting Started', 'Cast 10 votes', 'target', 'voting', 'common', 25, 10, 'total_votes'),
('Active Voter', 'Cast 50 votes', 'zap', 'voting', 'rare', 100, 50, 'total_votes'),
('Voting Machine', 'Cast 100 votes', 'bolt', 'voting', 'rare', 250, 100, 'total_votes'),
('Vote Legend', 'Cast 500 votes', 'crown', 'voting', 'epic', 1000, 500, 'total_votes'),
('Vote Master', 'Cast 1000 votes', 'trophy', 'voting', 'legendary', 2500, 1000, 'total_votes'),

-- Streak achievements
('Week Warrior', 'Vote for 7 consecutive days', 'calendar', 'voting', 'rare', 150, 7, 'consecutive_voting_days'),
('Month Master', 'Vote for 30 consecutive days', 'calendar-check', 'voting', 'epic', 500, 30, 'consecutive_voting_days'),
('Streak Legend', 'Vote for 100 consecutive days', 'flame', 'voting', 'legendary', 2000, 100, 'consecutive_voting_days'),

-- Engagement achievements
('Conversationalist', 'Leave 10 comments', 'message-circle', 'engagement', 'common', 50, 10, 'total_comments'),
('Community Voice', 'Leave 50 comments', 'megaphone', 'engagement', 'rare', 200, 50, 'total_comments'),
('Discussion Leader', 'Leave 100 comments', 'users', 'engagement', 'epic', 500, 100, 'total_comments'),

-- Community achievements
('List Creator', 'Create your first ranking list', 'list', 'community', 'common', 75, 1, 'ranking_lists_created'),
('Ranking Expert', 'Create 5 ranking lists', 'star', 'community', 'rare', 300, 5, 'ranking_lists_created'),
('Popular Voice', 'Receive 10 upvotes on comments', 'thumbs-up', 'community', 'rare', 200, 10, 'total_upvotes'),
('Community Favorite', 'Receive 50 upvotes on comments', 'heart', 'community', 'epic', 750, 50, 'total_upvotes');

-- Create trigger to automatically check achievements when member_stats updates
CREATE OR REPLACE FUNCTION public.trigger_achievement_check()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Call achievement check function asynchronously
  PERFORM public.check_and_award_achievements(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER member_stats_achievement_check
  AFTER UPDATE ON public.member_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_achievement_check();

-- Create view for user achievement progress
CREATE VIEW public.user_achievement_progress AS
SELECT 
  ua.user_id,
  a.id as achievement_id,
  a.name,
  a.description,
  a.icon,
  a.type,
  a.rarity,
  a.points,
  a.threshold_value,
  a.threshold_field,
  ua.earned_at,
  ua.progress_value,
  CASE 
    WHEN ua.id IS NOT NULL THEN true 
    ELSE false 
  END as is_earned,
  CASE 
    WHEN ua.id IS NOT NULL THEN 100.0
    WHEN a.threshold_value > 0 THEN 
      LEAST(100.0, (COALESCE(ua.progress_value, 0)::float / a.threshold_value::float) * 100.0)
    ELSE 0.0
  END as progress_percentage
FROM public.achievements a
LEFT JOIN public.user_achievements ua ON a.id = ua.achievement_id
WHERE a.is_active = true;
