-- Drop the existing permissive SELECT policies
DROP POLICY IF EXISTS "Admins can view all referrals" ON public.user_referrals;
DROP POLICY IF EXISTS "Users can view own referral" ON public.user_referrals;

-- Create new restrictive policy: Only authenticated users can view their own referral data
CREATE POLICY "Users can view own referral"
ON public.user_referrals
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all referrals (using the existing has_role function if available, otherwise direct check)
CREATE POLICY "Admins can view all referrals"
ON public.user_referrals
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);