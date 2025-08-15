-- Fix Critical Security Issue: Protect User Profile Data
-- Implement privacy-focused access controls to prevent unauthorized access to personal information

-- Remove the overly permissive policy that exposes all user data
DROP POLICY IF EXISTS "Authenticated users can view public profile info" ON public.profiles;

-- Create a secure public profile view that only exposes safe, non-sensitive information
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = true) AS
SELECT 
    id,
    username,
    avatar_url,
    -- Only show first name from full_name for privacy
    CASE 
        WHEN full_name IS NOT NULL THEN 
            SPLIT_PART(full_name, ' ', 1)
        ELSE NULL 
    END as first_name,
    created_at,
    -- Truncate bio to first 100 characters for privacy
    CASE 
        WHEN bio IS NOT NULL AND LENGTH(bio) > 100 THEN 
            LEFT(bio, 100) || '...'
        ELSE bio 
    END as bio_preview
FROM public.profiles;

-- Create restrictive RLS policy: authenticated users can only see limited public info
CREATE POLICY "Authenticated users can view limited public profile info" 
ON public.profiles FOR SELECT 
USING (
    -- Users can see their own complete profile
    auth.uid() = id
    OR 
    -- OR authenticated users can only see non-sensitive data (handled by public_profiles view)
    (auth.uid() IS NOT NULL AND auth.uid() <> id AND false)
);

-- Create a function to safely get public profile data for other users
CREATE OR REPLACE FUNCTION public.get_public_profile_safe(profile_user_id uuid)
RETURNS TABLE(
    id uuid,
    username text,
    avatar_url text,
    first_name text,
    bio_preview text,
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
        p.avatar_url,
        CASE 
            WHEN p.full_name IS NOT NULL THEN 
                SPLIT_PART(p.full_name, ' ', 1)
            ELSE NULL 
        END as first_name,
        CASE 
            WHEN p.bio IS NOT NULL AND LENGTH(p.bio) > 100 THEN 
                LEFT(p.bio, 100) || '...'
            ELSE p.bio 
        END as bio_preview,
        p.created_at
    FROM public.profiles p
    WHERE p.id = profile_user_id;
$$;

-- Grant access to the safe public profile function
GRANT EXECUTE ON FUNCTION public.get_public_profile_safe(uuid) TO anon, authenticated;

-- Grant read access to the public profiles view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Update the existing get_public_profile function to be more restrictive
CREATE OR REPLACE FUNCTION public.get_public_profile(user_uuid uuid DEFAULT NULL::uuid)
RETURNS TABLE(id uuid, username text, full_name text, avatar_url text, bio text, created_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- Only return data if requesting user is authenticated and it's their own profile
  -- OR return limited public data for other users
  SELECT 
    p.id,
    p.username,
    CASE 
      WHEN auth.uid() = p.id THEN p.full_name  -- Full name only for own profile
      WHEN p.full_name IS NOT NULL THEN SPLIT_PART(p.full_name, ' ', 1)  -- First name only for others
      ELSE NULL
    END as full_name,
    p.avatar_url,
    CASE 
      WHEN auth.uid() = p.id THEN p.bio  -- Full bio only for own profile
      WHEN p.bio IS NOT NULL AND LENGTH(p.bio) > 100 THEN LEFT(p.bio, 100) || '...'  -- Truncated bio for others
      ELSE p.bio
    END as bio,
    p.created_at
  FROM public.profiles p
  WHERE p.id = COALESCE(user_uuid, p.id)
    AND (auth.uid() IS NOT NULL);  -- Must be authenticated
$$;

-- Add additional security: Create audit logging for profile access attempts
CREATE TABLE IF NOT EXISTS public.profile_access_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    accessed_profile_id uuid NOT NULL,
    accessor_user_id uuid,
    access_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.profile_access_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can view profile access logs" 
ON public.profile_access_logs FOR SELECT 
USING (is_admin());

-- Create function to log profile access (for monitoring)
CREATE OR REPLACE FUNCTION public.log_profile_access(
    accessed_id uuid, 
    access_type text DEFAULT 'view'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only log if someone is trying to access another user's profile
    IF auth.uid() IS NOT NULL AND auth.uid() <> accessed_id THEN
        INSERT INTO public.profile_access_logs (
            accessed_profile_id, 
            accessor_user_id, 
            access_type
        ) VALUES (
            accessed_id, 
            auth.uid(), 
            access_type
        );
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_profile_access(uuid, text) TO authenticated;