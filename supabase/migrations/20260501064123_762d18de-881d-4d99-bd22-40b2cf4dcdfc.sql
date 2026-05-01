CREATE OR REPLACE FUNCTION public.get_member_with_most_achievements()
 RETURNS TABLE(id uuid, username text, avatar_url text, achievement_count integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    p.id,
    p.username,
    p.avatar_url,
    COUNT(ua.id)::integer AS achievement_count
  FROM public.profiles p
  JOIN public.user_achievements ua ON ua.user_id = p.id AND ua.earned_at IS NOT NULL
  GROUP BY p.id, p.username, p.avatar_url
  ORDER BY COUNT(ua.id) DESC
  LIMIT 1;
$function$;