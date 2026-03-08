
-- 1. Create get_all_users_paginated RPC (security definer, admin-only)
CREATE OR REPLACE FUNCTION public.get_all_users_paginated(
  page_number integer DEFAULT 1,
  page_size integer DEFAULT 50,
  search_term text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  total_count integer;
  offset_val integer;
BEGIN
  -- Admin check
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  offset_val := (page_number - 1) * page_size;

  -- Get total count
  SELECT count(*)::integer INTO total_count
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE search_term = '' 
    OR p.username ILIKE '%' || search_term || '%'
    OR u.email ILIKE '%' || search_term || '%';

  -- Get paginated users
  SELECT jsonb_build_object(
    'users', COALESCE(jsonb_agg(row_data ORDER BY row_data->>'created_at' DESC), '[]'::jsonb),
    'total_count', total_count
  ) INTO result
  FROM (
    SELECT jsonb_build_object(
      'id', u.id,
      'email', u.email,
      'username', COALESCE(p.username, 'Unknown'),
      'avatar_url', p.avatar_url,
      'role', COALESCE(ur.role, 'user'),
      'created_at', u.created_at
    ) AS row_data
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    LEFT JOIN public.user_roles ur ON ur.user_id = u.id
    WHERE search_term = '' 
      OR p.username ILIKE '%' || search_term || '%'
      OR u.email ILIKE '%' || search_term || '%'
    ORDER BY u.created_at DESC
    LIMIT page_size
    OFFSET offset_val
  ) sub;

  RETURN result;
END;
$$;

-- 2. Create set_user_role RPC (security definer, admin-only)
CREATE OR REPLACE FUNCTION public.set_user_role(
  target_user_id uuid,
  new_role text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mapped_role text;
BEGIN
  -- Admin check
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  -- Prevent removing own admin role
  IF target_user_id = auth.uid() AND new_role != 'admin' THEN
    RAISE EXCEPTION 'Cannot remove your own admin role';
  END IF;

  -- Map UI role to DB role
  CASE new_role
    WHEN 'staff_writer' THEN mapped_role := 'blog_editor';
    WHEN 'moderator' THEN mapped_role := 'moderator';
    WHEN 'admin' THEN mapped_role := 'admin';
    WHEN 'user' THEN mapped_role := NULL;
    ELSE RAISE EXCEPTION 'Invalid role: %', new_role;
  END CASE;

  -- Delete existing roles for user
  DELETE FROM public.user_roles WHERE user_id = target_user_id;

  -- Insert new role if not regular user
  IF mapped_role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, mapped_role);
  END IF;

  RETURN true;
END;
$$;

-- 3. Add RLS policy for staff writers to manage polls
CREATE POLICY "Staff writers can manage polls"
ON public.polls FOR ALL
TO authenticated
USING (can_manage_blog_content())
WITH CHECK (can_manage_blog_content());

-- 4. Add RLS policy for staff writers to manage poll options
CREATE POLICY "Staff writers can manage poll options"
ON public.poll_options FOR ALL
TO authenticated
USING (can_manage_blog_content())
WITH CHECK (can_manage_blog_content());

-- 5. Add RLS policy for moderators to delete comments
CREATE POLICY "Moderators can delete comments"
ON public.comments FOR DELETE
TO authenticated
USING (is_moderator_or_admin());
