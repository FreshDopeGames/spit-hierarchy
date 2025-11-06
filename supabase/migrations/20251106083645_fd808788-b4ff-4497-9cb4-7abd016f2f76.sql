-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can delete own old notifications" ON notifications;

-- Create a new policy that allows users to delete any of their own notifications
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE
  USING (auth.uid() = user_id);