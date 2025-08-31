-- Fix Critical Security Vulnerability: Restrict Profile Data Access
-- 
-- ISSUE: The current SECURITY DEFINER functions bypass RLS and expose 
-- sensitive user profile data to any authenticated user. This allows
-- potential data theft of personal information including full names,
-- birthdates, locations, and social media links.
--
-- SOLUTION: Update functions to only expose minimal public data and 
-- ensure proper access control.

-- 1. Update get_public_profile_full to only return truly public data
CREATE OR REPLACE FUNCTION public.get_public_profile_full(profile_user_id uuid)
 RETURNS TABLE(id uuid, username text, avatar_url text, bio text, created_at timestamp with time zone, member_stats jsonb)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  -- Only return basic public profile data - no sensitive information
  SELECT 
    p.id,
    p.username,
    p.avatar_url,
    -- Only show bio if it's the user's own profile or if they're viewing a public profile
    CASE 
      WHEN auth.uid() = p.id THEN p.bio
      WHEN LENGTH(COALESCE(p.bio, '')) <= 500 THEN p.bio  -- Only short bios are public
      ELSE NULL
    END as bio,
    p.created_at,
    -- Only show basic member stats, no sensitive data
    jsonb_build_object(
      'total_votes', COALESCE(ms.total_votes, 0),
      'status', COALESCE(ms.status::text, 'bronze'),
      'consecutive_voting_days', CASE WHEN auth.uid() = p.id THEN COALESCE(ms.consecutive_voting_days, 0) ELSE 0 END,
      'total_comments', COALESCE(ms.total_comments, 0),
      'ranking_lists_created', COALESCE(ms.ranking_lists_created, 0),
      'top_five_created', COALESCE(ms.top_five_created, 0)
    ) as member_stats
  FROM public.profiles p
  LEFT JOIN public.member_stats ms ON p.id = ms.id
  WHERE p.id = profile_user_id
    AND auth.uid() IS NOT NULL;  -- Must be authenticated
$function$;

-- 2. Update get_public_profiles_batch to only return minimal data
CREATE OR REPLACE FUNCTION public.get_public_profiles_batch(profile_user_ids uuid[])
 RETURNS TABLE(id uuid, username text, avatar_url text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  -- Only return minimal public data - username and avatar only
  SELECT 
    p.id,
    p.username,
    p.avatar_url
  FROM public.profiles p
  WHERE p.id = ANY(profile_user_ids)
    AND auth.uid() IS NOT NULL  -- Must be authenticated
    AND p.id <> auth.uid();  -- Exclude own profile from batch (use get_own_profile for that)
$function$;

-- 3. Update get_profile_for_display to be more restrictive
CREATE OR REPLACE FUNCTION public.get_profile_for_display(profile_user_id uuid)
 RETURNS TABLE(id uuid, username text, full_name text, avatar_url text, bio_preview text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    p.id,
    p.username,
    -- Only return full name for own profile, never for others
    CASE 
      WHEN auth.uid() = p.id THEN p.full_name
      ELSE NULL  -- Never expose full names to other users
    END as full_name,
    p.avatar_url,
    -- Only return bio for own profile or truncated public bio
    CASE 
      WHEN auth.uid() = p.id THEN p.bio
      WHEN p.bio IS NOT NULL AND LENGTH(p.bio) <= 200 THEN p.bio  -- Only very short bios are public
      ELSE NULL
    END as bio_preview,
    p.created_at
  FROM public.profiles p
  WHERE p.id = profile_user_id
    AND auth.uid() IS NOT NULL;  -- Must be authenticated
$function$;

-- 4. Remove the overly permissive get_public_profile function that exposes sensitive data
DROP FUNCTION IF EXISTS public.get_public_profile(uuid);

-- 5. Update find_user_by_username to be more restrictive
CREATE OR REPLACE FUNCTION public.find_user_by_username(search_username text)
 RETURNS TABLE(id uuid, username text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  -- Only return basic lookup data, no sensitive information
  SELECT 
    p.id,
    p.username
  FROM public.profiles p
  WHERE p.username = search_username
    AND auth.uid() IS NOT NULL;  -- Must be authenticated
$function$;

-- 6. Add a new secure function for getting own sensitive profile data
CREATE OR REPLACE FUNCTION public.get_own_complete_profile()
 RETURNS TABLE(id uuid, username text, full_name text, avatar_url text, bio text, location text, birthdate date, social_links jsonb, preferred_image_style image_style, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  -- Only return complete profile data for the authenticated user's own profile
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
  WHERE p.id = auth.uid()  -- Only own profile
    AND auth.uid() IS NOT NULL;
$function$;

-- 7. Add audit logging for profile access attempts
CREATE OR REPLACE FUNCTION public.log_profile_access_secure(accessed_id uuid, access_type text DEFAULT 'view')
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Log all profile access attempts for security monitoring
    IF auth.uid() IS NOT NULL THEN
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
    
    -- If someone is trying to access profile data they shouldn't have access to,
    -- log it as a potential security incident
    IF auth.uid() <> accessed_id AND access_type = 'unauthorized_attempt' THEN
        INSERT INTO public.audit_logs (
            user_id,
            action,
            table_name,
            record_id,
            new_values
        ) VALUES (
            auth.uid(),
            'UNAUTHORIZED_PROFILE_ACCESS_ATTEMPT',
            'profiles',
            accessed_id,
            jsonb_build_object(
                'attempted_access_type', access_type,
                'timestamp', NOW(),
                'ip_address', inet_client_addr()
            )
        );
    END IF;
END;
$function$;