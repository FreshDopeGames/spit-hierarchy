
-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true);

-- Create storage policy for public read access
CREATE POLICY "Public read access for blog images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'blog-images');

-- Create storage policy for authenticated upload access
CREATE POLICY "Authenticated upload access for blog images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'blog-images' AND
    auth.role() = 'authenticated'
  );

-- Create storage policy for authenticated update access
CREATE POLICY "Authenticated update access for blog images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'blog-images' AND
    auth.role() = 'authenticated'
  );

-- Create storage policy for authenticated delete access
CREATE POLICY "Authenticated delete access for blog images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'blog-images' AND
    auth.role() = 'authenticated'
  );
