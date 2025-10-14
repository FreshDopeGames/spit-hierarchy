-- Create user ranking votes table
CREATE TABLE IF NOT EXISTS public.user_ranking_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_ranking_id UUID NOT NULL REFERENCES public.user_rankings(id) ON DELETE CASCADE,
  rapper_id UUID NOT NULL REFERENCES public.rappers(id) ON DELETE CASCADE,
  vote_weight INTEGER NOT NULL DEFAULT 1,
  member_status member_status NOT NULL DEFAULT 'bronze'::member_status,
  vote_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate votes on same day
  CONSTRAINT unique_user_ranking_daily_vote 
    UNIQUE (user_id, user_ranking_id, rapper_id, vote_date)
);

-- Indexes for performance
CREATE INDEX idx_user_ranking_votes_user_id ON public.user_ranking_votes(user_id);
CREATE INDEX idx_user_ranking_votes_ranking_id ON public.user_ranking_votes(user_ranking_id);
CREATE INDEX idx_user_ranking_votes_rapper_id ON public.user_ranking_votes(rapper_id);
CREATE INDEX idx_user_ranking_votes_vote_date ON public.user_ranking_votes(vote_date);

-- Enable RLS
ALTER TABLE public.user_ranking_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create their own user ranking votes"
  ON public.user_ranking_votes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own user ranking votes"
  ON public.user_ranking_votes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view aggregated vote counts"
  ON public.user_ranking_votes
  FOR SELECT
  USING (true);

-- Add user_ranking_id column to daily_vote_tracking
ALTER TABLE public.daily_vote_tracking
ADD COLUMN IF NOT EXISTS user_ranking_id UUID REFERENCES public.user_rankings(id) ON DELETE CASCADE;

-- Drop old constraint if exists
ALTER TABLE public.daily_vote_tracking
DROP CONSTRAINT IF EXISTS daily_vote_tracking_user_id_rapper_id_ranking_id_vote_date_key;

-- Add new constraints that allow EITHER ranking_id OR user_ranking_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_vote_official_ranking 
  ON public.daily_vote_tracking(user_id, rapper_id, ranking_id, vote_date)
  WHERE ranking_id IS NOT NULL AND user_ranking_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_vote_user_ranking
  ON public.daily_vote_tracking(user_id, rapper_id, user_ranking_id, vote_date)
  WHERE user_ranking_id IS NOT NULL AND ranking_id IS NULL;

-- Create vote count view
CREATE MATERIALIZED VIEW IF NOT EXISTS user_ranking_vote_counts AS
SELECT 
  user_ranking_id,
  rapper_id,
  COUNT(*) as vote_count,
  SUM(vote_weight) as total_vote_weight,
  AVG(vote_weight) as avg_vote_weight
FROM public.user_ranking_votes
GROUP BY user_ranking_id, rapper_id;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_ranking_vote_counts_lookup 
  ON user_ranking_vote_counts(user_ranking_id, rapper_id);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_user_ranking_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_ranking_vote_counts;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to refresh on vote changes
DROP TRIGGER IF EXISTS trigger_refresh_user_ranking_votes ON public.user_ranking_votes;
CREATE TRIGGER trigger_refresh_user_ranking_votes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_ranking_votes
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_user_ranking_vote_counts();

-- Update member stats trigger
CREATE OR REPLACE FUNCTION public.update_member_stats_on_user_ranking_vote()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update member stats for the user who cast the user ranking vote
  INSERT INTO public.member_stats (id, total_votes, last_vote_date, updated_at)
  VALUES (NEW.user_id, 1, CURRENT_DATE, NOW())
  ON CONFLICT (id) 
  DO UPDATE SET 
    total_votes = public.member_stats.total_votes + 1,
    last_vote_date = CURRENT_DATE,
    updated_at = NOW(),
    consecutive_voting_days = CASE 
      WHEN public.member_stats.last_vote_date = CURRENT_DATE - INTERVAL '1 day' THEN 
        public.member_stats.consecutive_voting_days + 1
      WHEN public.member_stats.last_vote_date = CURRENT_DATE THEN 
        public.member_stats.consecutive_voting_days
      ELSE 1
    END;
  
  -- Check and award achievements
  PERFORM public.check_and_award_achievements(NEW.user_id);
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_member_stats_user_ranking_vote ON public.user_ranking_votes;
CREATE TRIGGER trigger_update_member_stats_user_ranking_vote
  AFTER INSERT ON public.user_ranking_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_member_stats_on_user_ranking_vote();

-- Update total vote count function
CREATE OR REPLACE FUNCTION public.get_user_ranking_vote_count(ranking_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_votes INTEGER;
BEGIN
  -- Count total votes for this user ranking
  SELECT COALESCE(SUM(vote_weight), 0)::INTEGER INTO total_votes
  FROM public.user_ranking_votes
  WHERE user_ranking_id = ranking_uuid;
  
  RETURN total_votes;
END;
$$;