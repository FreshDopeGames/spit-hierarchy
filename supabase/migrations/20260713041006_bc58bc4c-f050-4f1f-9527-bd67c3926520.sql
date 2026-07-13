
-- Restore Data-API grants on user_roles so RLS subqueries can read it
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- Replace rapper-images storage policies with has_role() (SECURITY DEFINER, bypasses grants)
DROP POLICY IF EXISTS "Only admins can upload rapper images" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can update rapper images storage" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can delete rapper images storage" ON storage.objects;

CREATE POLICY "Only admins can upload rapper images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'rapper-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update rapper images storage"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'rapper-images' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'rapper-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete rapper images storage"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'rapper-images' AND public.has_role(auth.uid(), 'admin'));

-- Same treatment for header-images
DROP POLICY IF EXISTS "Admin upload access for header images" ON storage.objects;
DROP POLICY IF EXISTS "Admin update access for header images" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete access for header images" ON storage.objects;

CREATE POLICY "Admin upload access for header images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'header-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin update access for header images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'header-images' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'header-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin delete access for header images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'header-images' AND public.has_role(auth.uid(), 'admin'));
