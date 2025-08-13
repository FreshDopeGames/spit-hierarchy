-- Comprehensive security fix migration
-- Fixes all Security Definer functions by adding SET search_path TO ''
-- This prevents SQL injection attacks via search path manipulation

-- Fix is_admin() function
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$function$;

-- Fix is_moderator_or_admin() function
CREATE OR REPLACE FUNCTION public.is_moderator_or_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  );
$function$;

-- Fix can_manage_blog_content() function
CREATE OR REPLACE FUNCTION public.can_manage_blog_content()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'blog_editor')
  );
$function$;

-- Fix get_public_profile() function
CREATE OR REPLACE FUNCTION public.get_public_profile(user_uuid uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, username text, full_name text, avatar_url text, bio text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.created_at
  FROM public.profiles p
  WHERE p.id = COALESCE(user_uuid, p.id);
$function$;

-- Fix has_role() function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$function$;

-- Fix can_manage_blog() function
CREATE OR REPLACE FUNCTION public.can_manage_blog(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT public.has_role(_user_id, 'admin') OR public.has_role(_user_id, 'blog_editor');
$function$;

-- Fix is_admin_user() function
CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$function$;

-- Fix get_user_voting_stats() function
CREATE OR REPLACE FUNCTION public.get_user_voting_stats()
 RETURNS TABLE(user_id uuid, total_votes bigint, categories_used bigint, average_rating_given numeric, first_vote_date timestamp with time zone, last_vote_date timestamp with time zone, unique_rappers_voted bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT 
    v.user_id,
    COUNT(*)::bigint as total_votes,
    COUNT(DISTINCT v.category_id)::bigint as categories_used,
    AVG(v.rating) as average_rating_given,
    MIN(v.created_at) as first_vote_date,
    MAX(v.created_at) as last_vote_date,
    COUNT(DISTINCT v.rapper_id)::bigint as unique_rappers_voted
  FROM public.votes v
  WHERE public.is_admin_user() = true
  GROUP BY v.user_id;
$function$;

-- Fix get_rapper_voting_analytics() function
CREATE OR REPLACE FUNCTION public.get_rapper_voting_analytics()
 RETURNS TABLE(id uuid, name text, total_votes bigint, unique_voters bigint, average_rating numeric, votes_last_7_days bigint, votes_last_30_days bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT 
    r.id,
    r.name,
    COUNT(v.id)::bigint as total_votes,
    COUNT(DISTINCT v.user_id)::bigint as unique_voters,
    AVG(v.rating) as average_rating,
    COUNT(CASE WHEN v.created_at >= NOW() - INTERVAL '7 days' THEN 1 END)::bigint as votes_last_7_days,
    COUNT(CASE WHEN v.created_at >= NOW() - INTERVAL '30 days' THEN 1 END)::bigint as votes_last_30_days
  FROM public.rappers r
  LEFT JOIN public.votes v ON r.id = v.rapper_id
  WHERE public.is_admin_user() = true
  GROUP BY r.id, r.name;
$function$;

-- Fix get_category_voting_analytics() function
CREATE OR REPLACE FUNCTION public.get_category_voting_analytics()
 RETURNS TABLE(id uuid, name text, description text, total_votes bigint, unique_voters bigint, unique_rappers bigint, average_rating numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT 
    vc.id,
    vc.name,
    vc.description,
    COUNT(v.id)::bigint as total_votes,
    COUNT(DISTINCT v.user_id)::bigint as unique_voters,
    COUNT(DISTINCT v.rapper_id)::bigint as unique_rappers,
    AVG(v.rating) as average_rating
  FROM public.voting_categories vc
  LEFT JOIN public.votes v ON vc.id = v.category_id
  WHERE public.is_admin_user() = true
  GROUP BY vc.id, vc.name, vc.description;
$function$;

-- Fix the security definer view issue by recreating the rapper_vote_stats view
-- without the security_barrier option
DROP VIEW IF EXISTS public.rapper_vote_stats;

-- Recreate the view without security_barrier
CREATE VIEW public.rapper_vote_stats AS
SELECT 
    r.id,
    r.name,
    r.slug,
    COUNT(v.id) AS total_votes,
    COUNT(DISTINCT v.user_id) AS unique_voters,
    ROUND(AVG(v.rating), 2) AS average_rating,
    COUNT(CASE WHEN v.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) AS votes_last_7_days,
    COUNT(CASE WHEN v.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) AS votes_last_30_days,
    MIN(v.created_at) AS first_vote_date,
    MAX(v.created_at) AS last_vote_date
FROM public.rappers r
LEFT JOIN public.votes v ON r.id = v.rapper_id
GROUP BY r.id, r.name, r.slug;

-- Grant appropriate permissions
GRANT SELECT ON public.rapper_vote_stats TO authenticated;
GRANT SELECT ON public.rapper_vote_stats TO anon;