CREATE TABLE public.album_listen_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE UNIQUE,
  total_listen_count INTEGER NOT NULL DEFAULT 0,
  total_user_count INTEGER NOT NULL DEFAULT 0,
  top_tracks JSONB NOT NULL DEFAULT '[]'::jsonb,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.album_listen_stats TO anon;
GRANT SELECT ON public.album_listen_stats TO authenticated;
GRANT ALL ON public.album_listen_stats TO service_role;

ALTER TABLE public.album_listen_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view album listen stats"
ON public.album_listen_stats
FOR SELECT
TO anon, authenticated
USING (true);

CREATE INDEX idx_album_listen_stats_album_id ON public.album_listen_stats(album_id);

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.schedule(
  'fetch-listenbrainz-stats-daily',
  '17 4 * * *',
  $$
  SELECT net.http_post(
    url := 'https://xzcmkssadekswmiqfbff.supabase.co/functions/v1/fetch-listenbrainz-stats',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6Y21rc3NhZGVrc3dtaXFmYmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNjQ0NDksImV4cCI6MjA2MzY0MDQ0OX0.j8BSOA66HYYFHg73ntnewGSf9xByQZ-9PHlR2JTRNQM"}'::jsonb,
    body := '{"source":"cron"}'::jsonb
  ) AS request_id;
  $$
);