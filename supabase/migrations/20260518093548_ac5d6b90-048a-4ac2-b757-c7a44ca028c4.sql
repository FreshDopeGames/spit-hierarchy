DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

CREATE POLICY "Users can create own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);