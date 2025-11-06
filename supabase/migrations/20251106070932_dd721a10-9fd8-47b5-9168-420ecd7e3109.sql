-- Add 'author' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'author';

-- Update can_manage_blog_content function to include authors
CREATE OR REPLACE FUNCTION public.can_manage_blog_content()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'author')
  );
$$;

-- Create a specific function to check author permissions
CREATE OR REPLACE FUNCTION public.can_author_blog_posts()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'author')
  );
$$;

-- Update blog_posts RLS policy to use the new function
DROP POLICY IF EXISTS "Blog editors full access" ON public.blog_posts;
CREATE POLICY "Authors and admins can manage blog posts" 
ON public.blog_posts 
FOR ALL 
USING (public.can_manage_blog_content()) 
WITH CHECK (public.can_manage_blog_content());

-- Update blog_categories RLS policy
DROP POLICY IF EXISTS "Admins and blog editors can manage categories" ON public.blog_categories;
CREATE POLICY "Authors and admins can manage categories" 
ON public.blog_categories 
FOR ALL 
USING (public.can_manage_blog_content());

-- Update blog_tags RLS policy
DROP POLICY IF EXISTS "Admins and blog editors can manage tags" ON public.blog_tags;
CREATE POLICY "Authors and admins can manage tags" 
ON public.blog_tags 
FOR ALL 
USING (public.can_manage_blog_content());

-- Update blog_post_tags RLS policy
DROP POLICY IF EXISTS "Admins and blog editors can manage post tags" ON public.blog_post_tags;
CREATE POLICY "Authors and admins can manage post tags" 
ON public.blog_post_tags 
FOR ALL 
USING (public.can_manage_blog_content());