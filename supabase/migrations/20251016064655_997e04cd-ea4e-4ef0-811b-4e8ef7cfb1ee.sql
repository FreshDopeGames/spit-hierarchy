-- Retry migration with constraint-agnostic ON CONFLICT handling

-- 1) Ensure ranking_id is nullable for user ranking tracking
ALTER TABLE public.daily_vote_tracking
  ALTER COLUMN ranking_id DROP NOT NULL;

-- 2) Ensure the unique index exists (expression-based, supports NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS daily_vote_tracking_unique_vote
ON public.daily_vote_tracking (
  user_id,
  rapper_id,
  COALESCE(ranking_id, '00000000-0000-0000-0000-000000000000'::uuid),
  COALESCE(user_ranking_id, '00000000-0000-0000-0000-000000000000'::uuid),
  vote_date
);

-- 3) Trigger function without naming a specific constraint (works with unique index)
CREATE OR REPLACE FUNCTION public.track_user_ranking_vote()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.daily_vote_tracking (user_id, rapper_id, user_ranking_id, ranking_id, vote_date)
  VALUES (NEW.user_id, NEW.rapper_id, NEW.user_ranking_id, NULL, NEW.vote_date)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to track user ranking vote: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4) Recreate trigger on user_ranking_votes
DROP TRIGGER IF EXISTS auto_track_user_ranking_vote ON public.user_ranking_votes;
CREATE TRIGGER auto_track_user_ranking_vote
  AFTER INSERT ON public.user_ranking_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.track_user_ranking_vote();

-- 5) Backfill today's tracking rows (non-blocking)
INSERT INTO public.daily_vote_tracking (user_id, rapper_id, user_ranking_id, ranking_id, vote_date)
SELECT urv.user_id, urv.rapper_id, urv.user_ranking_id, NULL, urv.vote_date
FROM public.user_ranking_votes urv
WHERE urv.vote_date = CURRENT_DATE
ON CONFLICT DO NOTHING;