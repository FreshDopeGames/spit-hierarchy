-- Table to track views of user-created rankings
CREATE TABLE IF NOT EXISTS public.user_ranking_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ranking_id UUID NOT NULL REFERENCES public.user_rankings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_ranking_views_ranking_id ON public.user_ranking_views(ranking_id);
CREATE INDEX IF NOT EXISTS idx_user_ranking_views_user_id ON public.user_ranking_views(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ranking_views_viewed_at ON public.user_ranking_views(viewed_at);

-- RLS Policies
ALTER TABLE public.user_ranking_views ENABLE ROW LEVEL SECURITY;

-- Anyone can track views (for anonymous users too)
CREATE POLICY "Anyone can track ranking views"
  ON public.user_ranking_views
  FOR INSERT
  WITH CHECK (true);

-- Users can view their own view history
CREATE POLICY "Users can view own ranking views"
  ON public.user_ranking_views
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all views
CREATE POLICY "Admins can view all ranking views"
  ON public.user_ranking_views
  FOR SELECT
  USING (is_admin());

-- Add views_count column for caching (avoids counting on every request)
ALTER TABLE public.user_rankings 
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- Create index for sorting by popularity
CREATE INDEX IF NOT EXISTS idx_user_rankings_views_count ON public.user_rankings(views_count DESC);

-- Function to calculate unique view count
CREATE OR REPLACE FUNCTION public.calculate_user_ranking_view_count(ranking_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  unique_view_count INTEGER;
BEGIN
  -- Count unique viewers (by user_id or session_id) in the last 30 days
  SELECT COUNT(DISTINCT COALESCE(user_id::text, session_id)) INTO unique_view_count
  FROM public.user_ranking_views
  WHERE ranking_id = ranking_uuid
    AND viewed_at >= NOW() - INTERVAL '30 days';
  
  RETURN COALESCE(unique_view_count, 0);
END;
$$;

-- Trigger function to update cached view count
CREATE OR REPLACE FUNCTION public.update_user_ranking_view_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update the cached view count for the ranking
  UPDATE public.user_rankings
  SET views_count = calculate_user_ranking_view_count(NEW.ranking_id),
      updated_at = NOW()
  WHERE id = NEW.ranking_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER trigger_update_user_ranking_view_count
  AFTER INSERT ON public.user_ranking_views
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_ranking_view_count();