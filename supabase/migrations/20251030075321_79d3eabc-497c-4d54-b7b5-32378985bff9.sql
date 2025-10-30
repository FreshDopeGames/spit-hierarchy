-- Fix get_profiles_for_analytics to work for unauthenticated users on public Analytics page
CREATE OR REPLACE FUNCTION public.get_profiles_for_analytics(profile_user_ids uuid[])
RETURNS TABLE(
  id uuid, 
  username text, 
  avatar_url text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  -- Return minimal public data for analytics displays (no auth required)
  SELECT 
    p.id,
    p.username,
    p.avatar_url
  FROM public.profiles p
  WHERE p.id = ANY(profile_user_ids);
  -- No authentication check - this is public leaderboard data
$function$;

-- Grant to both anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.get_profiles_for_analytics(uuid[]) TO anon, authenticated;