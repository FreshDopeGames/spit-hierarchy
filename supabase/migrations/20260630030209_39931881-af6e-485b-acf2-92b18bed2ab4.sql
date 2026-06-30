
DROP POLICY IF EXISTS "Service role can upload album covers" ON storage.objects;
DROP POLICY IF EXISTS "Service role can update album covers" ON storage.objects;

CREATE POLICY "Admins can upload album covers"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'album-covers'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update album covers"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'album-covers'
  AND public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'album-covers'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete album covers"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'album-covers'
  AND public.has_role(auth.uid(), 'admin')
);
