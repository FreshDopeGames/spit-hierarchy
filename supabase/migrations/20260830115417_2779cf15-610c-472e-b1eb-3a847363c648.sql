-- 1) Media mentions table
CREATE TABLE IF NOT EXISTS public.rapper_media_mentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rapper_id uuid NOT NULL REFERENCES public.rappers(id) ON DELETE CASCADE,
  title text NOT NULL,
  url text NOT NULL,
  source text NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rapper_media_mentions_unique UNIQUE (rapper_id, url)
);

CREATE INDEX IF NOT EXISTS idx_rapper_media_mentions_rapper_pub
  ON public.rapper_media_mentions (rapper_id, published_at DESC);

GRANT SELECT ON public.rapper_media_mentions TO anon;
GRANT SELECT ON public.rapper_media_mentions TO authenticated;
GRANT ALL ON public.rapper_media_mentions TO service_role;

ALTER TABLE public.rapper_media_mentions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Media mentions are publicly readable" ON public.rapper_media_mentions;
CREATE POLICY "Media mentions are publicly readable"
  ON public.rapper_media_mentions FOR SELECT
  USING (true);

-- 2) Cron shared secret in Vault (random, never exposed)
DO $$
DECLARE
  v_secret text;
  v_cmd text;
BEGIN
  SELECT decrypted_secret INTO v_secret
  FROM vault.decrypted_secrets WHERE name = 'trending_cron_secret';

  IF v_secret IS NULL THEN
    v_secret := encode(gen_random_bytes(32), 'hex');
    PERFORM vault.create_secret(v_secret, 'trending_cron_secret', 'Shared secret for the daily trending-rappers cron job');
  END IF;

  -- 3) Reschedule the daily job with an authenticating header
  PERFORM cron.unschedule('trending-rappers-daily') WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'trending-rappers-daily'
  );
  PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobid = 3;

  v_cmd := format($f$
    SELECT net.http_post(
      url := 'https://xzcmkssadekswmiqfbff.supabase.co/functions/v1/generate-trending-rappers',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-secret', %L
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $f$, v_secret);

  PERFORM cron.schedule('trending-rappers-daily', '0 14 * * *', v_cmd);
END $$;

-- 4) Verification helper for the edge function (service role only)
CREATE OR REPLACE FUNCTION public.verify_cron_secret(_secret text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, vault
AS $$
  SELECT EXISTS (
    SELECT 1 FROM vault.decrypted_secrets
    WHERE name = 'trending_cron_secret'
      AND decrypted_secret = _secret
  );
$$;

REVOKE ALL ON FUNCTION public.verify_cron_secret(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_cron_secret(text) TO service_role;