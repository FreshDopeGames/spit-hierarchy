-- Recalculate positions for all rankings based on current vote counts
-- This will order rappers by: vote count DESC → earliest vote ASC → name ASC

DO $$
BEGIN
  RAISE NOTICE 'Starting recalculation of all ranking positions...';
  
  -- Call the existing recalculate_ranking_positions function for all rankings
  -- When called with NULL, it processes all official_rankings
  PERFORM recalculate_ranking_positions(NULL);
  
  RAISE NOTICE 'Successfully recalculated positions for all rankings!';
END $$;