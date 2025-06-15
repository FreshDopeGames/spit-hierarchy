
-- Create a function to calculate total votes for a rapper from ranking_votes
CREATE OR REPLACE FUNCTION calculate_rapper_total_votes(rapper_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  total_weighted_votes INTEGER;
BEGIN
  SELECT COALESCE(SUM(vote_weight), 0)::INTEGER INTO total_weighted_votes
  FROM ranking_votes
  WHERE rapper_id = rapper_uuid;
  
  RETURN total_weighted_votes;
END;
$$;

-- Create a function to update rapper vote counts
CREATE OR REPLACE FUNCTION update_rapper_vote_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update the rapper's total votes count
  UPDATE rappers 
  SET 
    total_votes = calculate_rapper_total_votes(COALESCE(NEW.rapper_id, OLD.rapper_id)),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.rapper_id, OLD.rapper_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers to automatically update rapper vote counts
DROP TRIGGER IF EXISTS trigger_update_rapper_votes_on_insert ON ranking_votes;
CREATE TRIGGER trigger_update_rapper_votes_on_insert
  AFTER INSERT ON ranking_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_rapper_vote_count();

DROP TRIGGER IF EXISTS trigger_update_rapper_votes_on_update ON ranking_votes;
CREATE TRIGGER trigger_update_rapper_votes_on_update
  AFTER UPDATE ON ranking_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_rapper_vote_count();

DROP TRIGGER IF EXISTS trigger_update_rapper_votes_on_delete ON ranking_votes;
CREATE TRIGGER trigger_update_rapper_votes_on_delete
  AFTER DELETE ON ranking_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_rapper_vote_count();

-- Enable realtime for the rappers table
ALTER TABLE rappers REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE rappers;

-- Update existing rapper vote counts to sync with ranking_votes
UPDATE rappers 
SET total_votes = calculate_rapper_total_votes(id)
WHERE id IN (
  SELECT DISTINCT rapper_id 
  FROM ranking_votes
);
