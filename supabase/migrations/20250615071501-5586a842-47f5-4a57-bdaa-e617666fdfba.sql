
-- Create table to track daily votes for preventing duplicate votes within 24 hours
CREATE TABLE public.daily_vote_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  rapper_id UUID NOT NULL,
  ranking_id UUID NOT NULL,
  vote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, rapper_id, ranking_id, vote_date)
);

-- Add Row Level Security
ALTER TABLE public.daily_vote_tracking ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own daily vote records
CREATE POLICY "Users can view their own daily votes" 
  ON public.daily_vote_tracking 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for users to insert their own daily vote records
CREATE POLICY "Users can create their own daily vote records" 
  ON public.daily_vote_tracking 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_daily_vote_tracking_user_date ON public.daily_vote_tracking(user_id, vote_date);
CREATE INDEX idx_daily_vote_tracking_lookup ON public.daily_vote_tracking(user_id, rapper_id, ranking_id, vote_date);
