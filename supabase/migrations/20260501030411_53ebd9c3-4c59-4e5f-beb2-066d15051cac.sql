CREATE OR REPLACE FUNCTION public.can_manage_blog(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'blog_editor', 'author', 'moderator')
  );
$function$;

CREATE OR REPLACE FUNCTION public.can_manage_blog_content()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT public.can_manage_blog(auth.uid());
$function$;