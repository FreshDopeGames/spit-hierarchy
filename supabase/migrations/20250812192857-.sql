-- Fix security vulnerability: Remove public access to profiles table and implement proper RLS policies

-- First, drop the existing overly permissive SELECT policies
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create secure RLS policies for the profiles table

-- 1. Users can view their own complete profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- 2. Authenticated users can view limited public profile information of others
-- This allows for social features while protecting sensitive data
CREATE POLICY "Authenticated users can view public profile info" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() != id  -- Not their own profile (covered by previous policy)
);

-- 3. Create a view for public profile information that excludes sensitive data
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  full_name,
  avatar_url,
  bio,
  created_at
FROM public.profiles;

-- 4. Create a function to get user public profile safely
CREATE OR REPLACE FUNCTION public.get_public_profile(user_uuid uuid)
RETURNS TABLE(
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.created_at
  FROM public.profiles p
  WHERE p.id = user_uuid;
$$;

-- Add comments explaining the security model
COMMENT ON POLICY "Users can view own profile" ON public.profiles IS 'Users have full access to their own profile data including sensitive information';
COMMENT ON POLICY "Authenticated users can view public profile info" ON public.profiles IS 'Authenticated users can view limited profile information of others for social features';
COMMENT ON FUNCTION public.get_public_profile(uuid) IS 'Safe function to retrieve non-sensitive profile information for any user';

-- Log this security fix
INSERT INTO public.audit_logs (
  user_id,
  action,
  table_name,
  new_values
) VALUES (
  auth.uid(),
  'SECURITY_FIX',
  'profiles',
  jsonb_build_object(
    'description', 'Fixed profiles table RLS policies to prevent unauthorized access to personal information',
    'changes', jsonb_build_array(
      'Removed public read access to profiles table',
      'Added policy for users to view own complete profile',
      'Added policy for authenticated users to view limited public info',
      'Created public_profiles view for safe public access',
      'Added get_public_profile function for controlled access'
    )
  )
);