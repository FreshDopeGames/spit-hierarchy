-- Update the trigger function for attribute votes to track distinct rappers
CREATE OR REPLACE FUNCTION public.update_member_stats_on_vote()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  distinct_rapper_count INTEGER;
BEGIN
  -- Calculate distinct rappers voted on from both tables
  SELECT COUNT(DISTINCT rapper_id) INTO distinct_rapper_count
  FROM (
    SELECT rapper_id FROM public.ranking_votes WHERE user_id = NEW.user_id
    UNION
    SELECT rapper_id FROM public.votes WHERE user_id = NEW.user_id
  ) combined;

  -- Update member stats for the user who cast the attribute vote
  INSERT INTO public.member_stats (id, total_votes, rappers_voted_count, last_vote_date, updated_at)
  VALUES (NEW.user_id, 1, distinct_rapper_count, CURRENT_DATE, NOW())
  ON CONFLICT (id) 
  DO UPDATE SET 
    total_votes = public.member_stats.total_votes + 1,
    rappers_voted_count = distinct_rapper_count,
    last_vote_date = CURRENT_DATE,
    updated_at = NOW(),
    -- Update consecutive voting days logic
    consecutive_voting_days = CASE 
      WHEN public.member_stats.last_vote_date = CURRENT_DATE - INTERVAL '1 day' THEN 
        public.member_stats.consecutive_voting_days + 1
      WHEN public.member_stats.last_vote_date = CURRENT_DATE THEN 
        public.member_stats.consecutive_voting_days
      ELSE 1
    END;
  
  -- Check and award achievements for this user
  PERFORM public.check_and_award_achievements(NEW.user_id);
  
  RETURN NEW;
END;
$function$;

-- Update the trigger function for ranking votes to track distinct rappers
CREATE OR REPLACE FUNCTION public.update_member_stats_on_ranking_vote()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  distinct_rapper_count INTEGER;
BEGIN
  -- Calculate distinct rappers voted on from both tables
  SELECT COUNT(DISTINCT rapper_id) INTO distinct_rapper_count
  FROM (
    SELECT rapper_id FROM public.ranking_votes WHERE user_id = NEW.user_id
    UNION
    SELECT rapper_id FROM public.votes WHERE user_id = NEW.user_id
  ) combined;

  -- Update member stats for the user who cast the ranking vote
  INSERT INTO public.member_stats (id, total_votes, rappers_voted_count, last_vote_date, updated_at)
  VALUES (NEW.user_id, 1, distinct_rapper_count, CURRENT_DATE, NOW())
  ON CONFLICT (id) 
  DO UPDATE SET 
    total_votes = public.member_stats.total_votes + 1,
    rappers_voted_count = distinct_rapper_count,
    last_vote_date = CURRENT_DATE,
    updated_at = NOW(),
    -- Update consecutive voting days logic
    consecutive_voting_days = CASE 
      WHEN public.member_stats.last_vote_date = CURRENT_DATE - INTERVAL '1 day' THEN 
        public.member_stats.consecutive_voting_days + 1
      WHEN public.member_stats.last_vote_date = CURRENT_DATE THEN 
        public.member_stats.consecutive_voting_days
      ELSE 1
    END;
  
  -- Check and award achievements for this user
  PERFORM public.check_and_award_achievements(NEW.user_id);
  
  RETURN NEW;
END;
$function$;

-- Backfill existing rappers_voted_count data for all users
UPDATE public.member_stats ms
SET 
  rappers_voted_count = (
    SELECT COUNT(DISTINCT rapper_id) 
    FROM (
      SELECT rapper_id FROM public.ranking_votes WHERE user_id = ms.id
      UNION
      SELECT rapper_id FROM public.votes WHERE user_id = ms.id
    ) combined
  ),
  updated_at = NOW()
WHERE ms.id IN (
  SELECT DISTINCT user_id FROM public.ranking_votes
  UNION
  SELECT DISTINCT user_id FROM public.votes
);

-- Trigger achievement checks for all users who have votes
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT DISTINCT user_id FROM (
      SELECT user_id FROM public.ranking_votes
      UNION
      SELECT user_id FROM public.votes
    ) all_voters
  LOOP
    PERFORM public.check_and_award_achievements(user_record.user_id);
  END LOOP;
END $$;