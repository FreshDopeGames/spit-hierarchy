
-- Album voting categories
CREATE TABLE public.album_voting_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.album_voting_categories TO anon, authenticated;
GRANT ALL ON public.album_voting_categories TO service_role;

ALTER TABLE public.album_voting_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active album categories"
  ON public.album_voting_categories FOR SELECT
  USING (active = true);

CREATE POLICY "Admins manage album categories"
  ON public.album_voting_categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed categories
INSERT INTO public.album_voting_categories (name, description, display_order) VALUES
  ('Production', 'Beats, mixing, sonic quality', 1),
  ('Lyricism', 'Bars, wordplay, storytelling', 2),
  ('Cohesion', 'Flow and consistency across tracks', 3),
  ('Replay Value', 'How often you come back to it', 4),
  ('Cultural Impact', 'Influence and lasting significance', 5);

-- Album votes table
CREATE TABLE public.album_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.album_voting_categories(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 10),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, album_id, category_id)
);

GRANT SELECT ON public.album_votes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.album_votes TO authenticated;
GRANT ALL ON public.album_votes TO service_role;

ALTER TABLE public.album_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view album votes"
  ON public.album_votes FOR SELECT
  USING (true);

CREATE POLICY "Users insert own album votes"
  ON public.album_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own album votes"
  ON public.album_votes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own album votes"
  ON public.album_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_album_votes_album ON public.album_votes(album_id);
CREATE INDEX idx_album_votes_user ON public.album_votes(user_id);

-- Aggregate columns on albums
ALTER TABLE public.albums
  ADD COLUMN IF NOT EXISTS average_rating numeric(4,2),
  ADD COLUMN IF NOT EXISTS total_ratings integer NOT NULL DEFAULT 0;

-- Aggregate recompute function + trigger
CREATE OR REPLACE FUNCTION public.recompute_album_rating_aggregates()
RETURNS TRIGGER
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_album uuid;
BEGIN
  target_album := COALESCE(NEW.album_id, OLD.album_id);

  UPDATE public.albums a
  SET
    average_rating = sub.avg_rating,
    total_ratings = sub.rater_count,
    updated_at = now()
  FROM (
    SELECT
      ROUND(AVG(rating)::numeric, 2) AS avg_rating,
      COUNT(DISTINCT user_id) AS rater_count
    FROM public.album_votes
    WHERE album_id = target_album
  ) sub
  WHERE a.id = target_album;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_album_votes_aggregate
AFTER INSERT OR UPDATE OR DELETE ON public.album_votes
FOR EACH ROW EXECUTE FUNCTION public.recompute_album_rating_aggregates();

-- Updated_at trigger for album_votes
CREATE TRIGGER trg_album_votes_updated_at
BEFORE UPDATE ON public.album_votes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_album_voting_categories_updated_at
BEFORE UPDATE ON public.album_voting_categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
