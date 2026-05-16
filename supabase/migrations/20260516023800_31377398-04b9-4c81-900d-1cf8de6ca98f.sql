-- Enable pg_net so DB triggers can call HTTPS endpoints
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Helper: post a URL to the indexnow-submit edge function
CREATE OR REPLACE FUNCTION public.notify_indexnow(_url text)
RETURNS void
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://xzcmkssadekswmiqfbff.supabase.co/functions/v1/indexnow-submit',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object('url', _url)
  );
EXCEPTION WHEN OTHERS THEN
  -- Never block the originating write because of a notification failure
  RAISE WARNING 'IndexNow notify failed for %: %', _url, SQLERRM;
END;
$$;

-- Trigger function: rappers (fire when newly published or slug changes while published)
CREATE OR REPLACE FUNCTION public.trg_rappers_indexnow()
RETURNS trigger
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.publish_status = 'published' AND NEW.slug IS NOT NULL THEN
    IF (TG_OP = 'INSERT')
       OR (TG_OP = 'UPDATE' AND (
            COALESCE(OLD.publish_status, '') <> 'published'
            OR COALESCE(OLD.slug, '') <> NEW.slug
          )) THEN
      PERFORM public.notify_indexnow('https://spithierarchy.com/rapper/' || NEW.slug);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS rappers_indexnow_trigger ON public.rappers;
CREATE TRIGGER rappers_indexnow_trigger
AFTER INSERT OR UPDATE ON public.rappers
FOR EACH ROW EXECUTE FUNCTION public.trg_rappers_indexnow();

-- Trigger function: official_rankings (every insert; updates only on slug change)
CREATE OR REPLACE FUNCTION public.trg_rankings_indexnow()
RETURNS trigger
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NOT NULL THEN
    IF (TG_OP = 'INSERT')
       OR (TG_OP = 'UPDATE' AND COALESCE(OLD.slug, '') <> NEW.slug) THEN
      PERFORM public.notify_indexnow('https://spithierarchy.com/rankings/' || NEW.slug);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS rankings_indexnow_trigger ON public.official_rankings;
CREATE TRIGGER rankings_indexnow_trigger
AFTER INSERT OR UPDATE ON public.official_rankings
FOR EACH ROW EXECUTE FUNCTION public.trg_rankings_indexnow();