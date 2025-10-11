-- Create new function specifically for analytics leaderboards that includes current user
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
  -- Return minimal public data including current user for analytics displays
  SELECT 
    p.id,
    p.username,
    p.avatar_url
  FROM public.profiles p
  WHERE p.id = ANY(profile_user_ids)
    AND auth.uid() IS NOT NULL;  -- Must be authenticated
    -- NOTE: Does NOT exclude current user like get_public_profiles_batch does
$function$;

GRANT EXECUTE ON FUNCTION public.get_profiles_for_analytics(uuid[]) TO authenticated;