
-- First, let's create a trigger to update member_stats when votes are cast
CREATE OR REPLACE FUNCTION update_member_stats_on_vote()
RETURNS TRIGGER AS $$
BEGIN
  -- Update member stats for the user who cast the vote
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
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_update_member_stats_on_vote ON votes;
CREATE TRIGGER trigger_update_member_stats_on_vote
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_member_stats_on_vote();

-- Also create a trigger for comment counting
CREATE OR REPLACE FUNCTION update_member_stats_on_comment()
RETURNS TRIGGER AS $$
BEGIN
  -- Update member stats for the user who posted the comment
  INSERT INTO member_stats (id, total_comments, updated_at)
  VALUES (NEW.user_id, 1, NOW())
  ON CONFLICT (id) 
  DO UPDATE SET 
    total_comments = member_stats.total_comments + 1,
    updated_at = NOW();
  
  -- Check and award achievements for this user
  PERFORM check_and_award_achievements(NEW.user_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for comments
DROP TRIGGER IF EXISTS trigger_update_member_stats_on_comment ON comments;
CREATE TRIGGER trigger_update_member_stats_on_comment
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_member_stats_on_comment();

-- Enable realtime for user_achievements table so we can listen for new achievements
ALTER TABLE user_achievements REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE user_achievements;
