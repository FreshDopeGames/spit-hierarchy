-- Restore required Data API access for affected public tables.
GRANT SELECT ON public.rapper_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.rapper_images TO authenticated;
GRANT ALL ON public.rapper_images TO service_role;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
GRANT SELECT, UPDATE ON public.rappers TO authenticated;
GRANT SELECT ON public.rappers TO anon;
GRANT ALL ON public.rappers TO service_role;

-- Remove duplicate/permissive rapper_images table policies that conflict with admin-only management.
DROP POLICY IF EXISTS "Allow authenticated insert to rapper images" ON public.rapper_images;
DROP POLICY IF EXISTS "Allow authenticated update to rapper images" ON public.rapper_images;
DROP POLICY IF EXISTS "Allow authenticated delete to rapper images" ON public.rapper_images;
DROP POLICY IF EXISTS "Allow public read access to rapper images" ON public.rapper_images;
DROP POLICY IF EXISTS "Public read access" ON public.rapper_images;
DROP POLICY IF EXISTS "Only admins can insert rapper images" ON public.rapper_images;
DROP POLICY IF EXISTS "Only admins can update rapper images" ON public.rapper_images;
DROP POLICY IF EXISTS "Only admins can delete rapper images" ON public.rapper_images;
DROP POLICY IF EXISTS "Admin full access" ON public.rapper_images;

CREATE POLICY "Public can view rapper images"
ON public.rapper_images
FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can insert rapper images"
ON public.rapper_images
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update rapper images"
ON public.rapper_images
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete rapper images"
ON public.rapper_images
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Remove conflicting/permissive rapper-images storage policies.
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can upload rapper images" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can update rapper images storage" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can delete rapper images storage" ON storage.objects;

CREATE POLICY "Admins can upload rapper image files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'rapper-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update rapper image files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'rapper-images' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'rapper-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete rapper image files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'rapper-images' AND public.has_role(auth.uid(), 'admin'));

-- Remove overlapping generic avatar upload policy; keep owner-scoped avatar file policies.
DROP POLICY IF EXISTS "Authenticated upload access for avatars" ON storage.objects;