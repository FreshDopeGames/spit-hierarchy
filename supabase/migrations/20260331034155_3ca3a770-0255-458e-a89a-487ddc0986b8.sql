
ALTER TABLE public.polls ADD COLUMN voting_locked boolean NOT NULL DEFAULT false;

CREATE POLICY "Users can delete own votes on unlocked polls"
ON public.poll_votes
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM polls
    WHERE polls.id = poll_votes.poll_id
    AND polls.voting_locked = false
    AND polls.status = 'active'
  )
);
