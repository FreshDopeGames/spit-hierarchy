
-- 1. Add verified_artist to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'verified_artist';

-- 2. Claim status & method enums
DO $$ BEGIN
  CREATE TYPE public.rapper_claim_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.rapper_claim_method AS ENUM ('self_request', 'admin_assigned');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. rapper_claims table
CREATE TABLE IF NOT EXISTS public.rapper_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rapper_id uuid NOT NULL REFERENCES public.rappers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status public.rapper_claim_status NOT NULL DEFAULT 'pending',
  claim_method public.rapper_claim_method NOT NULL DEFAULT 'self_request',
  proof_url text,
  notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enforce 1:1 only among approved claims (users can re-apply if rejected)
CREATE UNIQUE INDEX IF NOT EXISTS rapper_claims_unique_approved_rapper
  ON public.rapper_claims(rapper_id) WHERE status = 'approved';
CREATE UNIQUE INDEX IF NOT EXISTS rapper_claims_unique_approved_user
  ON public.rapper_claims(user_id) WHERE status = 'approved';
CREATE UNIQUE INDEX IF NOT EXISTS rapper_claims_unique_pending_per_user_rapper
  ON public.rapper_claims(user_id, rapper_id) WHERE status = 'pending';

GRANT SELECT, INSERT ON public.rapper_claims TO authenticated;
GRANT ALL ON public.rapper_claims TO service_role;

ALTER TABLE public.rapper_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own claims"
  ON public.rapper_claims FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone authenticated can view approved claims"
  ON public.rapper_claims FOR SELECT TO authenticated
  USING (status = 'approved');

CREATE POLICY "Admins can view all claims"
  ON public.rapper_claims FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can submit their own self-claims"
  ON public.rapper_claims FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND claim_method = 'self_request'
  );

CREATE POLICY "Admins can insert any claim"
  ON public.rapper_claims FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update claims"
  ON public.rapper_claims FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete claims"
  ON public.rapper_claims FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Helper functions
CREATE OR REPLACE FUNCTION public.is_verified_artist(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.rapper_claims
    WHERE user_id = _user_id AND status = 'approved'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_verified_rapper_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT rapper_id FROM public.rapper_claims
  WHERE user_id = _user_id AND status = 'approved'
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_verified_for_rapper(_user_id uuid, _rapper_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.rapper_claims
    WHERE user_id = _user_id AND rapper_id = _rapper_id AND status = 'approved'
  );
$$;

-- Returns verified rapper info for a list of user ids (for comment styling)
CREATE OR REPLACE FUNCTION public.get_verified_rappers_for_users(_user_ids uuid[])
RETURNS TABLE(user_id uuid, rapper_id uuid, rapper_name text, rapper_slug text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT rc.user_id, r.id, r.name, r.slug
  FROM public.rapper_claims rc
  JOIN public.rappers r ON r.id = rc.rapper_id
  WHERE rc.status = 'approved' AND rc.user_id = ANY(_user_ids);
$$;

GRANT EXECUTE ON FUNCTION public.is_verified_artist(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_verified_rapper_id(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_verified_for_rapper(uuid, uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_verified_rappers_for_users(uuid[]) TO authenticated, anon;

-- 5. Trigger: when a claim is approved, grant verified_artist role + insert reverse
CREATE OR REPLACE FUNCTION public.handle_rapper_claim_approval()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status <> 'approved') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'verified_artist')
    ON CONFLICT (user_id, role) DO NOTHING;

    NEW.reviewed_at := COALESCE(NEW.reviewed_at, now());
  END IF;

  IF NEW.status <> 'approved' AND OLD.status = 'approved' THEN
    DELETE FROM public.user_roles
    WHERE user_id = NEW.user_id AND role = 'verified_artist';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS rapper_claims_approval_trigger ON public.rapper_claims;
CREATE TRIGGER rapper_claims_approval_trigger
  BEFORE INSERT OR UPDATE ON public.rapper_claims
  FOR EACH ROW EXECUTE FUNCTION public.handle_rapper_claim_approval();

-- updated_at trigger
DROP TRIGGER IF EXISTS rapper_claims_updated_at ON public.rapper_claims;
CREATE TRIGGER rapper_claims_updated_at
  BEFORE UPDATE ON public.rapper_claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Block verified artists from voting on rankings
DROP POLICY IF EXISTS "Verified artists cannot ranking-vote" ON public.ranking_votes;
CREATE POLICY "Verified artists cannot ranking-vote"
  ON public.ranking_votes AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (NOT public.is_verified_artist(auth.uid()));

DROP POLICY IF EXISTS "Verified artists cannot daily-vote" ON public.daily_vote_tracking;
CREATE POLICY "Verified artists cannot daily-vote"
  ON public.daily_vote_tracking AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (NOT public.is_verified_artist(auth.uid()));

DROP POLICY IF EXISTS "Verified artists cannot rate skills" ON public.votes;
CREATE POLICY "Verified artists cannot rate skills"
  ON public.votes AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (NOT public.is_verified_artist(auth.uid()));

-- 7. Allow verified artists to update only safe fields on their rapper
-- Trigger that reverts disallowed columns to OLD value when caller is a verified artist (and not admin)
CREATE OR REPLACE FUNCTION public.restrict_verified_artist_rapper_edits()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  is_admin_user boolean;
  is_verified_owner boolean;
BEGIN
  is_admin_user := public.has_role(auth.uid(), 'admin');
  IF is_admin_user THEN
    RETURN NEW;
  END IF;

  is_verified_owner := public.is_verified_for_rapper(auth.uid(), NEW.id);
  IF NOT is_verified_owner THEN
    RETURN NEW; -- other RLS handles non-owners; only restrict the verified-artist path
  END IF;

  -- Allowed-to-change set: bio, instagram_handle, twitter_handle, homepage_url, spotify_id
  -- Force everything else back to OLD
  NEW.name := OLD.name;
  NEW.real_name := OLD.real_name;
  NEW.slug := OLD.slug;
  NEW.origin := OLD.origin;
  NEW.birth_year := OLD.birth_year;
  NEW.birth_month := OLD.birth_month;
  NEW.birth_day := OLD.birth_day;
  NEW.death_year := OLD.death_year;
  NEW.death_month := OLD.death_month;
  NEW.death_day := OLD.death_day;
  NEW.aliases := OLD.aliases;
  NEW.image_url := OLD.image_url;
  NEW.career_start := OLD.career_start;
  NEW.verified := OLD.verified;
  NEW.publish_status := OLD.publish_status;
  NEW.musicbrainz_id := OLD.musicbrainz_id;
  NEW.total_votes := OLD.total_votes;
  NEW.average_rating := OLD.average_rating;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS restrict_verified_artist_rapper_edits ON public.rappers;
CREATE TRIGGER restrict_verified_artist_rapper_edits
  BEFORE UPDATE ON public.rappers
  FOR EACH ROW EXECUTE FUNCTION public.restrict_verified_artist_rapper_edits();

-- RLS policy letting verified owners update their own rapper
DROP POLICY IF EXISTS "Verified artists can update own rapper" ON public.rappers;
CREATE POLICY "Verified artists can update own rapper"
  ON public.rappers FOR UPDATE TO authenticated
  USING (public.is_verified_for_rapper(auth.uid(), id))
  WITH CHECK (public.is_verified_for_rapper(auth.uid(), id));
