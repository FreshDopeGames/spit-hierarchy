-- Create secure function to get full public profile data for authenticated users
CREATE OR REPLACE FUNCTION public.get_public_profile_full(profile_user_id uuid)
RETURNS TABLE(
  id uuid, 
  username text, 
  avatar_url text, 
  bio text, 
  created_at timestamp with time zone,
  member_stats jsonb
) 
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    p.id,
    p.username,
    p.avatar_url,
    p.bio,
    p.created_at,
    jsonb_build_object(
      'total_votes', COALESCE(ms.total_votes, 0),
      'status', COALESCE(ms.status::text, 'bronze'),
      'consecutive_voting_days', COALESCE(ms.consecutive_voting_days, 0),
      'total_comments', COALESCE(ms.total_comments, 0),
      'ranking_lists_created', COALESCE(ms.ranking_lists_created, 0),
      'top_five_created', COALESCE(ms.top_five_created, 0)
    ) as member_stats
  FROM public.profiles p
  LEFT JOIN public.member_stats ms ON p.id = ms.id
  WHERE p.id = profile_user_id
    AND auth.uid() IS NOT NULL;  -- Must be authenticated
$function$;

-- Create secure function to get multiple public profiles for authenticated users
CREATE OR REPLACE FUNCTION public.get_public_profiles_batch(profile_user_ids uuid[])
RETURNS TABLE(
  id uuid, 
  username text, 
  avatar_url text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    p.id,
    p.username,
    p.avatar_url
  FROM public.profiles p
  WHERE p.id = ANY(profile_user_ids)
    AND auth.uid() IS NOT NULL;  -- Must be authenticated
$function$;

-- Update the existing get_profile_for_display to be more permissive for authenticated users
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
    -- Only return first name for others, full name for own profile
    CASE 
      WHEN auth.uid() = p.id THEN p.full_name
      ELSE NULL  -- Don't expose any part of full name to others
    END as full_name,
    p.avatar_url,
    -- Return full bio for own profile, full bio for others too (no truncation for community)
    CASE 
      WHEN auth.uid() = p.id THEN p.bio
      ELSE p.bio  -- Full bio for community viewing
    END as bio_preview,
    p.created_at
  FROM public.profiles p
  WHERE p.id = profile_user_id
    AND auth.uid() IS NOT NULL;  -- Must be authenticated
$function$;