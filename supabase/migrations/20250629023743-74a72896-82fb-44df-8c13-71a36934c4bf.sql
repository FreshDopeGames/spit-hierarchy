
-- Phase 2: Add Security & RLS Policies for user_rankings table
-- Enable RLS on user_rankings table if not already enabled
ALTER TABLE public.user_rankings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to recreate them properly
DROP POLICY IF EXISTS "Public read public rankings" ON public.user_rankings;
DROP POLICY IF EXISTS "Users create own rankings" ON public.user_rankings;
DROP POLICY IF EXISTS "Users update own rankings" ON public.user_rankings;
DROP POLICY IF EXISTS "Users delete own rankings" ON public.user_rankings;

-- Create secure RLS policies for user_rankings
CREATE POLICY "Public read public rankings" ON public.user_rankings 
  FOR SELECT 
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users create own rankings" ON public.user_rankings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users update own rankings" ON public.user_rankings 
  FOR UPDATE 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own rankings" ON public.user_rankings 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Phase 3: Data Structure Improvements
-- Add unique constraint on slug to prevent conflicts
ALTER TABLE public.user_rankings 
ADD CONSTRAINT unique_user_ranking_slug 
UNIQUE (slug);

-- Create index for better performance on slug lookups
CREATE INDEX IF NOT EXISTS idx_user_rankings_slug ON public.user_rankings (slug);
CREATE INDEX IF NOT EXISTS idx_user_rankings_user_public ON public.user_rankings (user_id, is_public);

-- Phase 2 continued: Add RLS policies for user_ranking_items
ALTER TABLE public.user_ranking_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read ranking items" ON public.user_ranking_items;

-- Create policy for user_ranking_items based on parent ranking visibility
CREATE POLICY "Public read ranking items" ON public.user_ranking_items 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_rankings ur 
      WHERE ur.id = ranking_id 
      AND (ur.is_public = true OR ur.user_id = auth.uid())
    )
  );

-- Ensure all existing user rankings have slugs (data migration)
UPDATE public.user_rankings 
SET slug = LOWER(REGEXP_REPLACE(
  REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'), 
  '\s+', '-', 'g'
)) || '-' || SUBSTRING(id::text, 1, 8)
WHERE slug IS NULL OR slug = '';
