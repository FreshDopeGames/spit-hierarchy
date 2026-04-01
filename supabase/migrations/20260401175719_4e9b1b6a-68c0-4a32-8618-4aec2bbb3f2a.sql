-- Allow the service role (used by edge function) to delete profiles
-- The edge function uses the service_role key which bypasses RLS,
-- so no additional RLS policies are needed.
-- However, we should ensure user_roles has a DELETE policy for cleanup.

-- Allow admins to delete user roles (for cleanup during account deletion)
CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
);
