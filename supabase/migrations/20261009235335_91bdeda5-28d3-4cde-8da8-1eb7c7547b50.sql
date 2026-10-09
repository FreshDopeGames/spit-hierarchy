CREATE TABLE public.track_youtube_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid NOT NULL UNIQUE REFERENCES public.album_tracks(id) ON DELETE CASCADE,
  youtube_video_id text,
  status text NOT NULL DEFAULT 'matched',
  checked_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.track_youtube_matches TO anon, authenticated;
GRANT ALL ON public.track_youtube_matches TO service_role;
ALTER TABLE public.track_youtube_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view track video matches" ON public.track_youtube_matches FOR SELECT USING (true);