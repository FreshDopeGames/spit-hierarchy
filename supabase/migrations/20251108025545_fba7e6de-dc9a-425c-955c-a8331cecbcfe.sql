-- Enable public profile viewing for unauthenticated users
-- This allows anyone to view public profiles without requiring authentication

-- Update find_user_by_username to allow anonymous access
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
  WHERE p.username = search_username;
  -- Removed auth.uid() IS NOT NULL check to allow public access
$function$;

-- Update get_public_profile_full to allow anonymous access
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
  WHERE p.id = profile_user_id;
  -- Removed auth.uid() IS NOT NULL check to allow public access
$function$;

-- Grant execute permissions to anonymous users
GRANT EXECUTE ON FUNCTION public.find_user_by_username(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_profile_full(uuid) TO anon;

-- Ensure authenticated users can still access these functions
GRANT EXECUTE ON FUNCTION public.find_user_by_username(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profile_full(uuid) TO authenticated;