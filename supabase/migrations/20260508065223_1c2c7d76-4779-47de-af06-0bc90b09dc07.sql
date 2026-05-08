
ALTER TABLE public.rappers
  ADD COLUMN IF NOT EXISTS publish_status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

ALTER TABLE public.rappers
  DROP CONSTRAINT IF EXISTS rappers_publish_status_check;
ALTER TABLE public.rappers
  ADD CONSTRAINT rappers_publish_status_check CHECK (publish_status IN ('draft','published'));

UPDATE public.rappers
  SET published_at = COALESCE(published_at, created_at, now())
  WHERE publish_status = 'published' AND published_at IS NULL;

CREATE INDEX IF NOT EXISTS rappers_publish_status_idx ON public.rappers (publish_status);

CREATE OR REPLACE FUNCTION public.set_rapper_published_at()
RETURNS TRIGGER
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.publish_status = 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_rapper_published_at ON public.rappers;
CREATE TRIGGER trg_set_rapper_published_at
  BEFORE INSERT OR UPDATE OF publish_status ON public.rappers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_rapper_published_at();

-- Tighten public SELECT: only published rows for non-staff
DROP POLICY IF EXISTS "Public read access" ON public.rappers;
DROP POLICY IF EXISTS "Public read rappers" ON public.rappers;
DROP POLICY IF EXISTS "Anyone can view rappers" ON public.rappers;

CREATE POLICY "Public read published rappers"
  ON public.rappers
  FOR SELECT
  USING (
    publish_status = 'published'
    OR public.is_admin()
    OR public.is_moderator_or_admin()
  );
