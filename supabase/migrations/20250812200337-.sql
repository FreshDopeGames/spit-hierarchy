-- Fix critical security vulnerability: votes table publicly readable
-- This migration secures user voting data while maintaining functionality

-- Step 1: Remove existing permissive policies on votes table
DROP POLICY IF EXISTS "Public read access" ON public.votes;
DROP POLICY IF EXISTS "Anyone can view votes" ON public.votes;
DROP POLICY IF EXISTS "Users can view all votes" ON public.votes;

-- Step 2: Create secure RLS policies for votes table
-- Users can only see their own votes
CREATE POLICY "Users can view own votes only" 
ON public.votes 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own votes
CREATE POLICY "Users can create own votes" 
ON public.votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own votes
CREATE POLICY "Users can update own votes" 
ON public.votes 
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Admins can view all votes for moderation purposes
CREATE POLICY "Admins can view all votes" 
ON public.votes 
FOR SELECT 
USING (is_admin());

-- Step 3: Create secure aggregated views for public consumption
-- Public rapper statistics (no individual user data exposed)
CREATE OR REPLACE VIEW public.rapper_vote_stats AS
SELECT 
  r.id,
  r.name,
  r.slug,
  COUNT(v.id)::bigint as total_votes,
  COUNT(DISTINCT v.user_id)::bigint as unique_voters,
  ROUND(AVG(v.rating), 2) as average_rating,
  COUNT(CASE WHEN v.created_at >= NOW() - INTERVAL '7 days' THEN 1 END)::bigint as votes_last_7_days,
  COUNT(CASE WHEN v.created_at >= NOW() - INTERVAL '30 days' THEN 1 END)::bigint as votes_last_30_days,
  MIN(v.created_at) as first_vote_date,
  MAX(v.created_at) as last_vote_date
FROM public.rappers r
LEFT JOIN public.votes v ON r.id = v.rapper_id
GROUP BY r.id, r.name, r.slug;

-- Enable RLS on the view (even though it's aggregated, for consistency)
ALTER VIEW public.rapper_vote_stats SET (security_barrier = true);

-- Step 4: Create secure function for category voting analytics
CREATE OR REPLACE FUNCTION public.get_public_category_stats()
RETURNS TABLE(
  category_id uuid,
  category_name text,
  total_votes bigint,
  unique_voters bigint,
  unique_rappers bigint,
  average_rating numeric
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    vc.id as category_id,
    vc.name as category_name,
    COUNT(v.id)::bigint as total_votes,
    COUNT(DISTINCT v.user_id)::bigint as unique_voters,
    COUNT(DISTINCT v.rapper_id)::bigint as unique_rappers,
    ROUND(AVG(v.rating), 2) as average_rating
  FROM public.voting_categories vc
  LEFT JOIN public.votes v ON vc.id = v.category_id
  GROUP BY vc.id, vc.name
  ORDER BY total_votes DESC;
$$;

-- Step 5: Create function for trending rappers (without exposing individual votes)
CREATE OR REPLACE FUNCTION public.get_trending_rappers(days_back integer DEFAULT 7)
RETURNS TABLE(
  rapper_id uuid,
  rapper_name text,
  recent_votes bigint,
  recent_average_rating numeric,
  total_votes bigint,
  momentum_score numeric
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    r.id as rapper_id,
    r.name as rapper_name,
    COUNT(CASE WHEN v.created_at >= NOW() - (days_back || ' days')::INTERVAL THEN 1 END)::bigint as recent_votes,
    ROUND(AVG(CASE WHEN v.created_at >= NOW() - (days_back || ' days')::INTERVAL THEN v.rating END), 2) as recent_average_rating,
    COUNT(v.id)::bigint as total_votes,
    -- Momentum score: recent votes weighted by recency and rating
    ROUND(
      (COUNT(CASE WHEN v.created_at >= NOW() - (days_back || ' days')::INTERVAL THEN 1 END)::numeric * 
       COALESCE(AVG(CASE WHEN v.created_at >= NOW() - (days_back || ' days')::INTERVAL THEN v.rating END), 0)) / 
      NULLIF(days_back, 0), 2
    ) as momentum_score
  FROM public.rappers r
  LEFT JOIN public.votes v ON r.id = v.rapper_id
  GROUP BY r.id, r.name
  HAVING COUNT(CASE WHEN v.created_at >= NOW() - (days_back || ' days')::INTERVAL THEN 1 END) > 0
  ORDER BY momentum_score DESC, recent_votes DESC;
$$;

-- Step 6: Grant necessary permissions
GRANT SELECT ON public.rapper_vote_stats TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_category_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_trending_rappers(integer) TO anon, authenticated;

-- Step 7: Add security audit log
INSERT INTO public.audit_logs (
  user_id,
  action,
  table_name,
  record_id,
  new_values
) VALUES (
  auth.uid(),
  'SECURITY_FIX_VOTES_TABLE',
  'votes',
  NULL,
  jsonb_build_object(
    'description', 'Fixed critical security vulnerability in votes table',
    'changes', jsonb_build_array(
      'Removed public read access to individual vote records',
      'Added user-specific RLS policies',
      'Created aggregated public views for statistics',
      'Added secure functions for trending data'
    ),
    'timestamp', NOW()
  )
);