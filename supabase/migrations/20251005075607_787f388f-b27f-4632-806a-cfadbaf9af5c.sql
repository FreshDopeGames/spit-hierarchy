-- Phase 1: Database Schema for Rapper Page View Tracking

-- Create rapper_page_views table
CREATE TABLE IF NOT EXISTS public.rapper_page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rapper_id UUID NOT NULL REFERENCES public.rappers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add activity_score column to rappers table
ALTER TABLE public.rappers 
ADD COLUMN IF NOT EXISTS activity_score INTEGER NOT NULL DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rapper_page_views_rapper_id ON public.rapper_page_views(rapper_id);
CREATE INDEX IF NOT EXISTS idx_rapper_page_views_user_id ON public.rapper_page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_rapper_page_views_session_id ON public.rapper_page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_rapper_page_views_viewed_at ON public.rapper_page_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_rapper_page_views_rapper_viewed ON public.rapper_page_views(rapper_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_rappers_activity_score ON public.rappers(activity_score DESC);

-- Enable Row Level Security
ALTER TABLE public.rapper_page_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rapper_page_views
-- Anyone can insert a page view (for tracking purposes)
CREATE POLICY "Anyone can track page views"
ON public.rapper_page_views
FOR INSERT
TO public
WITH CHECK (true);

-- Users can view their own page views
CREATE POLICY "Users can view own page views"
ON public.rapper_page_views
FOR SELECT
TO public
USING (auth.uid() = user_id);

-- Admins can view all page views
CREATE POLICY "Admins can view all page views"
ON public.rapper_page_views
FOR SELECT
TO public
USING (is_admin());

-- Comment on the table
COMMENT ON TABLE public.rapper_page_views IS 'Tracks page views for rapper detail pages to calculate activity scores';