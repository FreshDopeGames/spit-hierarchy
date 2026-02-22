CREATE OR REPLACE FUNCTION public.get_user_rated_rapper_ids(p_user_id uuid)
RETURNS TABLE(rapper_id uuid)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT DISTINCT v.rapper_id
  FROM public.votes v
  WHERE v.user_id = p_user_id;
$$;