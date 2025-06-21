
-- Add a new achievement for creating top 5 rappers
INSERT INTO public.achievements (name, description, icon, type, rarity, points, threshold_value, threshold_field) 
VALUES (
  'Top 5 Creator', 
  'Create your personal Top 5 rappers list', 
  'list', 
  'community', 
  'common', 
  50, 
  1, 
  'top_five_created'
);

-- Add the top_five_created field to member_stats table to track this achievement
ALTER TABLE public.member_stats 
ADD COLUMN IF NOT EXISTS top_five_created integer DEFAULT 0;

-- Create a function to update member stats when top 5 is created/updated
CREATE OR REPLACE FUNCTION public.update_member_stats_on_top_five()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update member stats for the user who created/updated their top 5
  INSERT INTO member_stats (id, top_five_created, updated_at)
  VALUES (NEW.user_id, 1, NOW())
  ON CONFLICT (id) 
  DO UPDATE SET 
    top_five_created = GREATEST(member_stats.top_five_created, 1),
    updated_at = NOW();
  
  -- Check and award achievements for this user
  PERFORM check_and_award_achievements(NEW.user_id);
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically check achievements when user_top_rappers is updated
DROP TRIGGER IF EXISTS user_top_rappers_achievement_check ON public.user_top_rappers;
CREATE TRIGGER user_top_rappers_achievement_check
  AFTER INSERT OR UPDATE ON public.user_top_rappers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_member_stats_on_top_five();

-- Update the check_and_award_achievements function to handle the new field
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
      WHEN 'top_five_created' THEN
        current_value := user_stats_record.top_five_created;
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

-- Update the user_achievement_progress view to include the new field
DROP VIEW IF EXISTS public.user_achievement_progress;

CREATE OR REPLACE VIEW public.user_achievement_progress AS
SELECT
    p.id as user_id,
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
    -- Dynamically calculate progress based on the live member_stats table.
    CASE
        WHEN a.threshold_field = 'total_votes' THEN COALESCE(ms.total_votes, 0)
        WHEN a.threshold_field = 'consecutive_voting_days' THEN COALESCE(ms.consecutive_voting_days, 0)
        WHEN a.threshold_field = 'total_comments' THEN COALESCE(ms.total_comments, 0)
        WHEN a.threshold_field = 'ranking_lists_created' THEN COALESCE(ms.ranking_lists_created, 0)
        WHEN a.threshold_field = 'total_upvotes' THEN COALESCE(ms.total_upvotes, 0)
        WHEN a.threshold_field = 'top_five_created' THEN COALESCE(ms.top_five_created, 0)
        ELSE 0
    END as progress_value,
    -- Determine if the achievement has been earned.
    (ua.id IS NOT NULL) as is_earned,
    -- Dynamically calculate the progress percentage.
    CASE
        WHEN ua.id IS NOT NULL THEN 100.0
        WHEN a.threshold_value > 0 THEN
            LEAST(100.0, (
                (CASE
                    WHEN a.threshold_field = 'total_votes' THEN COALESCE(ms.total_votes, 0)
                    WHEN a.threshold_field = 'consecutive_voting_days' THEN COALESCE(ms.consecutive_voting_days, 0)
                    WHEN a.threshold_field = 'total_comments' THEN COALESCE(ms.total_comments, 0)
                    WHEN a.threshold_field = 'ranking_lists_created' THEN COALESCE(ms.ranking_lists_created, 0)
                    WHEN a.threshold_field = 'total_upvotes' THEN COALESCE(ms.total_upvotes, 0)
                    WHEN a.threshold_field = 'top_five_created' THEN COALESCE(ms.top_five_created, 0)
                    ELSE 0
                END)::float / a.threshold_value::float
            ) * 100.0)
        ELSE 0.0
    END as progress_percentage
FROM
    public.profiles p
CROSS JOIN
    public.achievements a
LEFT JOIN
    public.user_achievements ua ON a.id = ua.achievement_id AND p.id = ua.user_id
LEFT JOIN
    public.member_stats ms ON p.id = ms.id
WHERE
    a.is_active = true;
