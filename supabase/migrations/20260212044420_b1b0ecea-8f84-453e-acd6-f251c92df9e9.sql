DROP FUNCTION IF EXISTS public.get_own_profile();

CREATE OR REPLACE FUNCTION public.get_own_profile()
RETURNS TABLE (
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  bio text,
  location text,
  birth_day integer,
  birth_month integer,
  social_links jsonb,
  preferred_image_style public.image_style,
  created_at timestamptz,
  updated_at timestamptz,
  username_last_changed_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.location,
    p.birth_day,
    p.birth_month,
    p.social_links,
    p.preferred_image_style,
    p.created_at,
    p.updated_at,
    p.username_last_changed_at
  FROM public.profiles p
  WHERE p.id = auth.uid();
$$;