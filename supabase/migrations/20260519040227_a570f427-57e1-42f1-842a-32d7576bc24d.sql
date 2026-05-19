-- Enable extensions for cron + http
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Trending rappers snapshot table
CREATE TABLE public.trending_rappers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rapper_id UUID NOT NULL REFERENCES public.rappers(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL CHECK (rank >= 1 AND rank <= 5),
  mention_count INTEGER NOT NULL DEFAULT 0,
  sources TEXT[] NOT NULL DEFAULT '{}',
  score NUMERIC NOT NULL DEFAULT 0,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_trending_rappers_generated_at ON public.trending_rappers(generated_at DESC);
CREATE INDEX idx_trending_rappers_rapper_id ON public.trending_rappers(rapper_id);

ALTER TABLE public.trending_rappers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trending rappers are viewable by everyone"
  ON public.trending_rappers FOR SELECT
  USING (true);

-- No public insert/update/delete; edge function uses service role

-- Schedule daily cron job at 14:00 UTC (6 AM PT)
SELECT cron.schedule(
  'generate-trending-rappers-daily',
  '0 14 * * *',
  $$
  SELECT net.http_post(
    url := 'https://xzcmkssadekswmiqfbff.supabase.co/functions/v1/generate-trending-rappers',
    headers := '{"Content-Type": "application/json", "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6Y21rc3NhZGVrc3dtaXFmYmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNjQ0NDksImV4cCI6MjA2MzY0MDQ0OX0.j8BSOA66HYYFHg73ntnewGSf9xByQZ-9PHlR2JTRNQM"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);