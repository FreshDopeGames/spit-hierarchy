
-- Create function to calculate average rating from attribute votes
CREATE OR REPLACE FUNCTION calculate_rapper_average_rating(rapper_uuid uuid)
RETURNS numeric
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  avg_rating NUMERIC;
BEGIN
  SELECT COALESCE(AVG(rating), 0) INTO avg_rating
  FROM votes
  WHERE rapper_id = rapper_uuid;
  
  RETURN ROUND(avg_rating, 2);
END;
$$;

-- Create function to calculate total attribute votes
CREATE OR REPLACE FUNCTION calculate_rapper_attribute_votes(rapper_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  total_votes INTEGER;
BEGIN
  SELECT COALESCE(COUNT(*), 0)::INTEGER INTO total_votes
  FROM votes
  WHERE rapper_id = rapper_uuid;
  
  RETURN total_votes;
END;
$$;

-- Create function to update rapper stats from attribute votes
CREATE OR REPLACE FUNCTION update_rapper_attribute_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update the rapper's average rating and total votes from attribute votes
  UPDATE rappers 
  SET 
    average_rating = calculate_rapper_average_rating(COALESCE(NEW.rapper_id, OLD.rapper_id)),
    total_votes = calculate_rapper_attribute_votes(COALESCE(NEW.rapper_id, OLD.rapper_id)),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.rapper_id, OLD.rapper_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers to automatically update rapper stats from attribute votes
DROP TRIGGER IF EXISTS trigger_update_rapper_stats_on_vote_insert ON votes;
CREATE TRIGGER trigger_update_rapper_stats_on_vote_insert
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_rapper_attribute_stats();

DROP TRIGGER IF EXISTS trigger_update_rapper_stats_on_vote_update ON votes;
CREATE TRIGGER trigger_update_rapper_stats_on_vote_update
  AFTER UPDATE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_rapper_attribute_stats();

DROP TRIGGER IF EXISTS trigger_update_rapper_stats_on_vote_delete ON votes;
CREATE TRIGGER trigger_update_rapper_stats_on_vote_delete
  AFTER DELETE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_rapper_attribute_stats();

-- Create trigger to update member stats when attribute votes are cast
DROP TRIGGER IF EXISTS trigger_update_member_stats_on_attribute_vote ON votes;
CREATE TRIGGER trigger_update_member_stats_on_attribute_vote
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_member_stats_on_vote();

-- Update existing rapper stats to sync with current attribute votes
UPDATE rappers 
SET 
  average_rating = calculate_rapper_average_rating(id),
  total_votes = calculate_rapper_attribute_votes(id)
WHERE id IN (
  SELECT DISTINCT rapper_id 
  FROM votes
);
