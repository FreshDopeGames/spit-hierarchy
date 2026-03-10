-- Add flagging columns to member_journal_entries
ALTER TABLE public.member_journal_entries
  ADD COLUMN is_flagged BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN flagged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN flagged_at TIMESTAMPTZ,
  ADD COLUMN flag_reason TEXT;

-- Update the public view policy to exclude flagged entries
DROP POLICY IF EXISTS "Public can view published public entries" ON public.member_journal_entries;
CREATE POLICY "Public can view published public entries"
  ON public.member_journal_entries
  FOR SELECT
  USING (is_public = true AND status = 'published' AND is_flagged = false);

-- Allow moderators/admins to update any journal entry (for flagging)
CREATE POLICY "Moderators can flag journal entries"
  ON public.member_journal_entries
  FOR UPDATE
  TO authenticated
  USING (is_moderator_or_admin())
  WITH CHECK (is_moderator_or_admin());

-- Allow moderators/admins to read all entries for moderation
CREATE POLICY "Moderators can view all journal entries"
  ON public.member_journal_entries
  FOR SELECT
  TO authenticated
  USING (is_moderator_or_admin());