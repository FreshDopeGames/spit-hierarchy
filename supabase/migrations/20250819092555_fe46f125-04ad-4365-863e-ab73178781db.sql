-- Comprehensive Profile Security Fix
-- Drop broken RLS policy that allows all access
DROP POLICY IF EXISTS "Authenticated users can view public profile data" ON public.profiles;

-- Create secure, restrictive RLS policies
-- Policy 1: Users can only view their own complete profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Users can only update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- Policy 3: Users can only insert their own profile
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Create secure functions for controlled access to profile data

-- Function 1: Get own complete profile (full access)
CREATE OR REPLACE FUNCTION public.get_own_profile()
RETURNS TABLE(
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  bio text,
  location text,
  birthdate date,
  social_links jsonb,
  preferred_image_style image_style,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.location,
    p.birthdate,
    p.social_links,
    p.preferred_image_style,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.id = auth.uid();
$function$;

-- Function 2: Get minimal public profile data for display (data minimization)
CREATE OR REPLACE FUNCTION public.get_public_profile_minimal(profile_user_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  avatar_url text,
  first_name text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    p.id,
    p.username,
    p.avatar_url,
    CASE 
      WHEN p.full_name IS NOT NULL THEN 
        SPLIT_PART(p.full_name, ' ', 1)
      ELSE NULL 
    END as first_name
  FROM public.profiles p
  WHERE p.id = profile_user_id
    AND auth.uid() IS NOT NULL  -- Must be authenticated
    AND auth.uid() <> profile_user_id;  -- Cannot be own profile (use get_own_profile)
$function$;

-- Function 3: Get multiple profiles safely (batch operation)
CREATE OR REPLACE FUNCTION public.get_profiles_batch(profile_user_ids uuid[])
RETURNS TABLE(
  id uuid,
  username text,
  avatar_url text,
  first_name text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    p.id,
    p.username,
    p.avatar_url,
    CASE 
      WHEN p.full_name IS NOT NULL THEN 
        SPLIT_PART(p.full_name, ' ', 1)
      ELSE NULL 
    END as first_name
  FROM public.profiles p
  WHERE p.id = ANY(profile_user_ids)
    AND auth.uid() IS NOT NULL  -- Must be authenticated
    AND auth.uid() <> p.id;  -- Exclude own profile from batch
$function$;

-- Function 4: Get public profile with enhanced data for specific contexts (e.g., rankings, comments)
CREATE OR REPLACE FUNCTION public.get_profile_for_display(profile_user_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  bio_preview text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    p.id,
    p.username,
    -- Return first name only for others, full name for own profile
    CASE 
      WHEN auth.uid() = p.id THEN p.full_name
      WHEN p.full_name IS NOT NULL THEN SPLIT_PART(p.full_name, ' ', 1)
      ELSE NULL 
    END as full_name,
    p.avatar_url,
    -- Return full bio for own profile, truncated for others
    CASE 
      WHEN auth.uid() = p.id THEN p.bio
      WHEN p.bio IS NOT NULL AND LENGTH(p.bio) > 100 THEN LEFT(p.bio, 100) || '...'
      ELSE p.bio
    END as bio_preview,
    p.created_at
  FROM public.profiles p
  WHERE p.id = profile_user_id
    AND auth.uid() IS NOT NULL;  -- Must be authenticated
$function$;

-- Function 5: Search profiles (for admin/moderator use)
CREATE OR REPLACE FUNCTION public.search_profiles_admin(search_term text DEFAULT '')
RETURNS TABLE(
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.created_at
  FROM public.profiles p
  WHERE (
    public.is_admin() OR public.is_moderator_or_admin()
  ) AND (
    search_term = '' OR
    p.username ILIKE '%' || search_term || '%' OR
    p.full_name ILIKE '%' || search_term || '%'
  )
  ORDER BY p.created_at DESC;
$function$;