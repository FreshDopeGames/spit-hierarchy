
-- Create function to calculate rapper percentile based on average attribute rating
CREATE OR REPLACE FUNCTION calculate_rapper_percentile(rapper_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  rapper_rating NUMERIC;
  total_rappers_with_votes INTEGER;
  rappers_below INTEGER;
  percentile_result INTEGER;
BEGIN
  -- Get the rapper's average rating
  SELECT average_rating INTO rapper_rating
  FROM rappers
  WHERE id = rapper_uuid AND total_votes > 0;
  
  -- If rapper has no votes, return null
  IF rapper_rating IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Count total rappers with votes
  SELECT COUNT(*) INTO total_rappers_with_votes
  FROM rappers
  WHERE total_votes > 0;
  
  -- Need at least 3 rappers to calculate meaningful percentiles
  IF total_rappers_with_votes < 3 THEN
    RETURN NULL;
  END IF;
  
  -- Count rappers with lower ratings
  SELECT COUNT(*) INTO rappers_below
  FROM rappers
  WHERE total_votes > 0 AND average_rating < rapper_rating;
  
  -- Calculate percentile (rounded to nearest integer)
  percentile_result := ROUND((rappers_below::NUMERIC / total_rappers_with_votes::NUMERIC) * 100);
  
  RETURN percentile_result;
END;
$$;
