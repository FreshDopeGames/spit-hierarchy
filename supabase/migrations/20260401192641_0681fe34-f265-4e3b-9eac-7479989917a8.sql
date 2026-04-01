
-- =============================================
-- 1. Fix rapper_images TABLE policies
-- =============================================

-- Drop overly permissive authenticated policies
DROP POLICY IF EXISTS "Authenticated users can insert rapper images" ON public.rapper_images;
DROP POLICY IF EXISTS "Authenticated users can update rapper images" ON public.rapper_images;
DROP POLICY IF EXISTS "Authenticated users can delete rapper images" ON public.rapper_images;

-- Create admin-only write policies
CREATE POLICY "Only admins can insert rapper images"
ON public.rapper_images FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update rapper images"
ON public.rapper_images FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can delete rapper images"
ON public.rapper_images FOR DELETE
TO authenticated
USING (public.is_admin());

-- =============================================
-- 2. Fix rapper-images STORAGE bucket policies
-- =============================================

DROP POLICY IF EXISTS "Authenticated users can upload rapper images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update rapper images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete rapper images" ON storage.objects;

CREATE POLICY "Only admins can upload rapper images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'rapper-images'
  AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Only admins can update rapper images storage"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'rapper-images'
  AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Only admins can delete rapper images storage"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'rapper-images'
  AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- =============================================
-- 3. Fix blog-images STORAGE bucket policies
-- =============================================

DROP POLICY IF EXISTS "Authenticated users can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete blog images" ON storage.objects;

CREATE POLICY "Blog editors can update blog images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'blog-images'
  AND public.can_manage_blog_content()
);

CREATE POLICY "Blog editors can delete blog images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'blog-images'
  AND public.can_manage_blog_content()
);

-- =============================================
-- 4. Fix avatars STORAGE bucket policies
-- =============================================

DROP POLICY IF EXISTS "Authenticated delete access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update access for avatars" ON storage.objects;

-- The user-scoped policies (storage.foldername check) should already exist and remain

-- =============================================
-- 5. Fix user_achievements self-grant
-- =============================================

DROP POLICY IF EXISTS "Users can insert their own achievements" ON public.user_achievements;

-- =============================================
-- 6. Fix user_quiz_badges self-grant
-- =============================================

DROP POLICY IF EXISTS "System can insert user quiz badges" ON public.user_quiz_badges;
DROP POLICY IF EXISTS "Users can insert their own quiz badges" ON public.user_quiz_badges;
