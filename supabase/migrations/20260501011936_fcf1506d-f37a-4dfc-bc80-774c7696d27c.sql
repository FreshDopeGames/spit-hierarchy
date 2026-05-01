-- Keep blog-management permission checks consistent across admin, staff writer, and author roles
CREATE OR REPLACE FUNCTION public.can_manage_blog(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'blog_editor', 'author')
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_blog_content()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.can_manage_blog(auth.uid());
$$;

-- Let blog managers resolve author display data needed by admin blog listings
CREATE OR REPLACE FUNCTION public.search_profiles_admin(search_term text DEFAULT ''::text)
RETURNS TABLE(id uuid, username text, full_name text, avatar_url text, created_at timestamp with time zone)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.created_at
  FROM public.profiles p
  WHERE public.can_manage_blog(auth.uid())
    AND (
      search_term = '' OR
      p.username ILIKE '%' || search_term || '%' OR
      p.full_name ILIKE '%' || search_term || '%'
    )
  ORDER BY p.created_at DESC;
$$;

-- Single secure source for the Admin Dashboard blog list, including drafts
CREATE OR REPLACE FUNCTION public.get_admin_blog_posts()
RETURNS TABLE(
  id uuid,
  title text,
  slug text,
  excerpt text,
  content text,
  featured_image_url text,
  category_id uuid,
  author_id uuid,
  status text,
  published_at timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  meta_title text,
  meta_description text,
  featured boolean,
  view_count integer,
  likes_count integer,
  video_url text,
  blog_categories jsonb,
  author_profile jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    bp.id,
    bp.title,
    bp.slug,
    bp.excerpt,
    bp.content,
    bp.featured_image_url,
    bp.category_id,
    bp.author_id,
    bp.status,
    bp.published_at,
    bp.created_at,
    bp.updated_at,
    bp.meta_title,
    bp.meta_description,
    bp.featured,
    bp.view_count,
    bp.likes_count,
    bp.video_url,
    CASE
      WHEN bc.id IS NULL THEN NULL
      ELSE jsonb_build_object('name', bc.name)
    END AS blog_categories,
    CASE
      WHEN p.id IS NULL THEN NULL
      ELSE jsonb_build_object(
        'id', p.id,
        'username', p.username,
        'full_name', p.full_name,
        'avatar_url', p.avatar_url
      )
    END AS author_profile
  FROM public.blog_posts bp
  LEFT JOIN public.blog_categories bc ON bc.id = bp.category_id
  LEFT JOIN public.profiles p ON p.id = bp.author_id
  WHERE public.can_manage_blog(auth.uid())
  ORDER BY bp.created_at DESC;
$$;