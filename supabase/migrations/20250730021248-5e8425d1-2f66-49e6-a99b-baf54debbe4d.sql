-- Add allow_write_in column to polls table
ALTER TABLE public.polls 
ADD COLUMN allow_write_in boolean NOT NULL DEFAULT false;

-- Update RLS policies to require authentication for poll voting
-- Remove anonymous voting capability by updating poll_votes policy
DROP POLICY IF EXISTS "Users can vote on polls" ON public.poll_votes;

CREATE POLICY "Authenticated users can vote on polls" 
ON public.poll_votes 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM polls 
    WHERE polls.id = poll_votes.poll_id 
    AND polls.status = 'active' 
    AND (polls.expires_at IS NULL OR polls.expires_at > now())
  )
);