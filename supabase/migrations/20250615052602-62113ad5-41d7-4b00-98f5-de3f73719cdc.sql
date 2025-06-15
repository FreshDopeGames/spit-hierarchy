
-- Create a function to update member stats when ranking votes are cast
CREATE OR REPLACE FUNCTION update_member_stats_on_ranking_vote()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update member stats for the user who cast the ranking vote
  INSERT INTO member_stats (id, total_votes, last_vote_date, updated_at)
  VALUES (NEW.user_id, 1, CURRENT_DATE, NOW())
  ON CONFLICT (id) 
  DO UPDATE SET 
    total_votes = member_stats.total_votes + 1,
    last_vote_date = CURRENT_DATE,
    updated_at = NOW(),
    -- Update consecutive voting days logic
    consecutive_voting_days = CASE 
      WHEN member_stats.last_vote_date = CURRENT_DATE - INTERVAL '1 day' THEN 
        member_stats.consecutive_voting_days + 1
      WHEN member_stats.last_vote_date = CURRENT_DATE THEN 
        member_stats.consecutive_voting_days
      ELSE 1
    END;
  
  -- Check and award achievements for this user
  PERFORM check_and_award_achievements(NEW.user_id);
  
  RETURN NEW;
END;
$$;

-- Create the trigger for ranking votes
DROP TRIGGER IF EXISTS trigger_update_member_stats_on_ranking_vote ON ranking_votes;
CREATE TRIGGER trigger_update_member_stats_on_ranking_vote
  AFTER INSERT ON ranking_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_member_stats_on_ranking_vote();

-- Backfill existing member stats to reflect votes already cast in ranking_votes
UPDATE member_stats 
SET 
  total_votes = (
    SELECT COUNT(*) 
    FROM ranking_votes 
    WHERE ranking_votes.user_id = member_stats.id
  ),
  updated_at = NOW()
WHERE id IN (
  SELECT DISTINCT user_id 
  FROM ranking_votes
);

-- Manually trigger achievement checks for users who have existing ranking votes
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT DISTINCT user_id 
    FROM ranking_votes
  LOOP
    PERFORM check_and_award_achievements(user_record.user_id);
  END LOOP;
END;
$$;
