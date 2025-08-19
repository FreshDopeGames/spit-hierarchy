-- Create secure function to get total member count that bypasses RLS
CREATE OR REPLACE FUNCTION public.get_total_member_count()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COUNT(*)::integer FROM public.profiles;
$function$;