-- Create a secure function to find users by username for public profile lookups
CREATE OR REPLACE FUNCTION public.find_user_by_username(search_username text)
RETURNS TABLE(id uuid, username text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    p.id,
    p.username
  FROM public.profiles p
  WHERE p.username = search_username
    AND auth.uid() IS NOT NULL;  -- Must be authenticated
$function$;