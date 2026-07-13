-- Rebuild rapper-images storage policies using public.is_admin() (same check the admin UI uses)
DROP POLICY IF EXISTS "Admins can upload rapper image files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update rapper image files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete rapper image files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read rapper image files" ON storage.objects;

CREATE POLICY "Admins can upload rapper image files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'rapper-images' AND public.is_admin());

CREATE POLICY "Admins can update rapper image files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'rapper-images' AND public.is_admin())
WITH CHECK (bucket_id = 'rapper-images' AND public.is_admin());

CREATE POLICY "Admins can delete rapper image files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'rapper-images' AND public.is_admin());

CREATE POLICY "Admins can read rapper image files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'rapper-images' AND public.is_admin());

-- Rebuild header-images storage policies with the same pattern
DROP POLICY IF EXISTS "Admin upload access for header images" ON storage.objects;
DROP POLICY IF EXISTS "Admin update access for header images" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete access for header images" ON storage.objects;
DROP POLICY IF EXISTS "Admin read access for header images" ON storage.objects;

CREATE POLICY "Admin upload access for header images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'header-images' AND public.is_admin());

CREATE POLICY "Admin update access for header images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'header-images' AND public.is_admin())
WITH CHECK (bucket_id = 'header-images' AND public.is_admin());

CREATE POLICY "Admin delete access for header images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'header-images' AND public.is_admin());

CREATE POLICY "Admin read access for header images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'header-images' AND public.is_admin());