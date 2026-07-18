CREATE OR REPLACE FUNCTION public.get_public_profiles_batch(profile_user_ids uuid[])
 RETURNS TABLE(id uuid, username text, avatar_url text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT p.id, p.username, p.avatar_url
  FROM public.profiles p
  WHERE p.id = ANY(profile_user_ids)
    AND auth.uid() IS NOT NULL;
$function$;