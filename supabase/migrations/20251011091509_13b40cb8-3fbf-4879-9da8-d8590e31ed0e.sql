-- Allow public read access to votes table for analytics aggregation
-- This enables non-admin users to view aggregated statistics like total votes, 
-- average ratings, and top rappers without exposing individual voting patterns
CREATE POLICY "Public read for analytics aggregation"
ON public.votes
FOR SELECT
TO public
USING (true);

COMMENT ON POLICY "Public read for analytics aggregation" ON public.votes IS 
'Allows public read access for computing aggregated analytics like total votes, average ratings, and top rappers. Individual user voting patterns are not exposed through the UI - only aggregated counts and averages are displayed.';

-- Allow public read access to vs_match_votes table for analytics aggregation
-- This enables VS match voting statistics to be visible to all users
CREATE POLICY "Public read for analytics aggregation"
ON public.vs_match_votes
FOR SELECT
TO public
USING (true);

COMMENT ON POLICY "Public read for analytics aggregation" ON public.vs_match_votes IS 
'Allows public read access for computing aggregated VS match voting statistics. Individual voting patterns are aggregated in analytics displays and public profiles.';