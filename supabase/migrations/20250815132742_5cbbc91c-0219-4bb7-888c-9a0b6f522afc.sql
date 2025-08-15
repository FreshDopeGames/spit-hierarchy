-- Fix Critical Security Issue: Protect User IDs and Personal Activity Data
-- Remove public access to user IDs and personal behavioral patterns while maintaining necessary functionality

-- 1. Fix ranking_votes table - Remove public user ID exposure
DROP POLICY IF EXISTS "Public read ranking votes" ON public.ranking_votes;
DROP POLICY IF EXISTS "Users can view all ranking votes" ON public.ranking_votes;

-- Create anonymized view for public ranking vote counts without exposing user IDs
CREATE OR REPLACE VIEW public.ranking_vote_counts
WITH (security_invoker = true) AS
SELECT 
    ranking_id,
    rapper_id,
    COUNT(*) as vote_count,
    SUM(vote_weight) as total_vote_weight,
    ROUND(AVG(vote_weight::numeric), 2) as avg_vote_weight
FROM public.ranking_votes
GROUP BY ranking_id, rapper_id;

-- Allow public read of anonymized ranking vote data only
CREATE POLICY "Public read anonymized ranking vote counts" 
ON public.ranking_votes FOR SELECT 
USING (false); -- Block all direct public access

-- Users can only see their own ranking votes
CREATE POLICY "Users view own ranking votes only" 
ON public.ranking_votes FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Fix votes table - Remove public user ID exposure  
DROP POLICY IF EXISTS "Public read votes" ON public.votes;

-- Create anonymized view for public vote statistics without exposing user IDs
CREATE OR REPLACE VIEW public.rapper_vote_counts
WITH (security_invoker = true) AS
SELECT 
    rapper_id,
    category_id,
    COUNT(*) as vote_count,
    ROUND(AVG(rating), 2) as average_rating,
    COUNT(DISTINCT user_id) as unique_voter_count
FROM public.votes
GROUP BY rapper_id, category_id;

-- Users can only see their own votes
CREATE POLICY "Users view own votes only" 
ON public.votes FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Fix user_top_rappers table - Remove public user ID exposure
DROP POLICY IF EXISTS "Public read user top rappers" ON public.user_top_rappers;
DROP POLICY IF EXISTS "Users can view all top rappers" ON public.user_top_rappers;

-- Create anonymized view for public top rapper statistics without exposing user IDs
CREATE OR REPLACE VIEW public.rapper_popularity_stats
WITH (security_invoker = true) AS
SELECT 
    rapper_id,
    COUNT(*) as times_in_top_five,
    COUNT(CASE WHEN position = 1 THEN 1 END) as times_ranked_first,
    ROUND(AVG(position::numeric), 2) as average_position
FROM public.user_top_rappers
GROUP BY rapper_id
HAVING COUNT(*) > 0;

-- Users can only see their own top rappers
CREATE POLICY "Users view own top rappers only" 
ON public.user_top_rappers FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Fix comment_likes table - Remove public user ID exposure
DROP POLICY IF EXISTS "Public read access" ON public.comment_likes;

-- Create anonymized view for public like counts without exposing user IDs
CREATE OR REPLACE VIEW public.comment_like_counts
WITH (security_invoker = true) AS
SELECT 
    comment_id,
    COUNT(*) as like_count
FROM public.comment_likes
GROUP BY comment_id;

-- Users can only see their own comment likes
CREATE POLICY "Users view own comment likes only" 
ON public.comment_likes FOR SELECT 
USING (auth.uid() = user_id);

-- 5. Fix blog_post_likes table - Remove public user ID exposure
DROP POLICY IF EXISTS "Anyone can view blog post likes" ON public.blog_post_likes;

-- Create anonymized view for public like counts without exposing user IDs
CREATE OR REPLACE VIEW public.blog_post_like_counts
WITH (security_invoker = true) AS
SELECT 
    post_id,
    COUNT(*) as like_count
FROM public.blog_post_likes
GROUP BY post_id;

-- Users can only see their own blog post likes
CREATE POLICY "Users view own blog post likes only" 
ON public.blog_post_likes FOR SELECT 
USING (auth.uid() = user_id);

-- 6. Fix poll_votes table - Remove public user ID exposure
DROP POLICY IF EXISTS "Anyone can view poll votes" ON public.poll_votes;

-- Create anonymized view for public poll results without exposing user IDs
CREATE OR REPLACE VIEW public.poll_results
WITH (security_invoker = true) AS
SELECT 
    poll_id,
    option_id,
    COUNT(*) as vote_count
FROM public.poll_votes
GROUP BY poll_id, option_id;

-- Users can only see their own poll votes (keep existing policy as it's already secure)
-- The "Users can view their own votes" policy already exists and is properly secured

-- Grant public read access to the new anonymized views
GRANT SELECT ON public.ranking_vote_counts TO anon, authenticated;
GRANT SELECT ON public.rapper_vote_counts TO anon, authenticated;
GRANT SELECT ON public.rapper_popularity_stats TO anon, authenticated;
GRANT SELECT ON public.comment_like_counts TO anon, authenticated;
GRANT SELECT ON public.blog_post_like_counts TO anon, authenticated;
GRANT SELECT ON public.poll_results TO anon, authenticated;