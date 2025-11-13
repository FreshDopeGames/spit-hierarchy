-- Add UPDATE RLS policy for daily_vote_tracking to fix upsert operations
CREATE POLICY "Users can update their own daily vote records"
  ON public.daily_vote_tracking
  FOR UPDATE
  TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);