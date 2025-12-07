-- Add cached_cover_url column to albums table
ALTER TABLE public.albums ADD COLUMN IF NOT EXISTS cached_cover_url text;

-- Create album-covers storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('album-covers', 'album-covers', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policy for public read access to album covers
CREATE POLICY "Public read access to album covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'album-covers');

-- RLS policy for service role uploads (edge functions use service role)
CREATE POLICY "Service role can upload album covers"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'album-covers');

-- RLS policy for service role updates (for upserts)
CREATE POLICY "Service role can update album covers"
ON storage.objects FOR UPDATE
USING (bucket_id = 'album-covers');