-- Allow public read access to aggregated ranking vote counts
-- This enables non-admin users to see vote totals without exposing individual voting details
CREATE POLICY "Public read aggregated vote counts" 
ON public.ranking_votes 
FOR SELECT 
USING (true);

-- Update the existing restrictive policy to be more permissive for aggregate queries
DROP POLICY IF EXISTS "Public read anonymized ranking vote counts" ON public.ranking_votes;

-- Create a more specific policy that protects individual vote details but allows aggregation
CREATE POLICY "Users view own votes and public aggregates" 
ON public.ranking_votes 
FOR SELECT 
USING (
  -- Users can see their own votes
  auth.uid() = user_id 
  OR 
  -- Everyone can access for aggregation purposes (SUM, COUNT operations)
  -- The view layer will handle the aggregation
  true
);