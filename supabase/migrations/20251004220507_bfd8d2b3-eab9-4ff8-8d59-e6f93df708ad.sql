-- Recalculate and update all rapper statistics from votes table
DO $$
DECLARE
  rapper_record RECORD;
  new_total_votes INTEGER;
  new_avg_rating NUMERIC;
BEGIN
  -- Loop through all rappers that have votes
  FOR rapper_record IN 
    SELECT DISTINCT r.id 
    FROM rappers r
    INNER JOIN votes v ON v.rapper_id = r.id
  LOOP
    -- Calculate total votes for this rapper
    SELECT COUNT(*)::INTEGER INTO new_total_votes
    FROM votes
    WHERE rapper_id = rapper_record.id;
    
    -- Calculate average rating for this rapper
    SELECT COALESCE(ROUND(AVG(rating), 2), 0)::NUMERIC INTO new_avg_rating
    FROM votes
    WHERE rapper_id = rapper_record.id;
    
    -- Update the rapper record
    UPDATE rappers
    SET 
      total_votes = new_total_votes,
      average_rating = new_avg_rating,
      updated_at = NOW()
    WHERE id = rapper_record.id;
    
    RAISE NOTICE 'Updated rapper %: % votes, % avg rating', rapper_record.id, new_total_votes, new_avg_rating;
  END LOOP;
END $$;