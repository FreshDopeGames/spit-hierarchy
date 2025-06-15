
-- Function to calculate member status based on achievement points
CREATE OR REPLACE FUNCTION public.calculate_member_status(total_points INTEGER)
RETURNS member_status
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF total_points >= 1000 THEN
    RETURN 'diamond'::member_status;
  ELSIF total_points >= 600 THEN
    RETURN 'platinum'::member_status;
  ELSIF total_points >= 300 THEN
    RETURN 'gold'::member_status;
  ELSIF total_points >= 100 THEN
    RETURN 'silver'::member_status;
  ELSE
    RETURN 'bronze'::member_status;
  END IF;
END;
$$;

-- Function to get vote weight based on member status
CREATE OR REPLACE FUNCTION public.get_vote_weight(status member_status)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  CASE status
    WHEN 'diamond' THEN RETURN 5;
    WHEN 'platinum' THEN RETURN 4;
    WHEN 'gold' THEN RETURN 3;
    WHEN 'silver' THEN RETURN 2;
    WHEN 'bronze' THEN RETURN 1;
    ELSE RETURN 1;
  END CASE;
END;
$$;

-- Create the ranking_votes table for weighted voting
CREATE TABLE public.ranking_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ranking_id UUID NOT NULL REFERENCES public.official_rankings(id) ON DELETE CASCADE,
  rapper_id UUID NOT NULL REFERENCES public.rappers(id) ON DELETE CASCADE,
  vote_weight INTEGER NOT NULL DEFAULT 1,
  member_status member_status NOT NULL DEFAULT 'bronze',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, ranking_id, rapper_id)
);

-- Enable RLS on ranking_votes
ALTER TABLE public.ranking_votes ENABLE ROW LEVEL SECURITY;

-- Create policies for ranking_votes
CREATE POLICY "Users can view all ranking votes" 
  ON public.ranking_votes 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own ranking votes" 
  ON public.ranking_votes 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ranking votes" 
  ON public.ranking_votes 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update member status when achievements are earned
CREATE OR REPLACE FUNCTION public.update_member_status_on_achievement()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  total_points INTEGER;
  new_status member_status;
  old_status member_status;
BEGIN
  -- Calculate total achievement points for the user
  SELECT COALESCE(SUM(a.points), 0)::INTEGER INTO total_points
  FROM public.user_achievements ua
  JOIN public.achievements a ON ua.achievement_id = a.id
  WHERE ua.user_id = NEW.user_id;
  
  -- Calculate new status
  new_status := public.calculate_member_status(total_points);
  
  -- Get current status
  SELECT status INTO old_status
  FROM public.member_stats
  WHERE id = NEW.user_id;
  
  -- Update member stats with new status
  UPDATE public.member_stats
  SET 
    status = new_status,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update member status when achievements are earned
DROP TRIGGER IF EXISTS trigger_update_member_status_on_achievement ON public.user_achievements;
CREATE TRIGGER trigger_update_member_status_on_achievement
  AFTER INSERT ON public.user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_member_status_on_achievement();

-- Update existing member stats to reflect proper status based on current achievement points
UPDATE public.member_stats 
SET status = public.calculate_member_status(
  COALESCE((
    SELECT SUM(a.points)::INTEGER
    FROM public.user_achievements ua
    JOIN public.achievements a ON ua.achievement_id = a.id
    WHERE ua.user_id = member_stats.id
  ), 0)
)
WHERE id IN (
  SELECT DISTINCT ua.user_id 
  FROM public.user_achievements ua
);

-- Enable realtime for ranking_votes table
ALTER TABLE public.ranking_votes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ranking_votes;
