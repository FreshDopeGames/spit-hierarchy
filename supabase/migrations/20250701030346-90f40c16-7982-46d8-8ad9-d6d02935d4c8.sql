
-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- First, let's temporarily remove the unique constraint to allow position updates
ALTER TABLE public.ranking_items DROP CONSTRAINT IF EXISTS ranking_items_ranking_id_position_key;

-- Create function to recalculate ranking positions (fixed version)
CREATE OR REPLACE FUNCTION public.recalculate_ranking_positions(target_ranking_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ranking_record RECORD;
  item_record RECORD;
  new_position INTEGER;
BEGIN
  -- If target_ranking_id is provided, only process that ranking
  -- Otherwise, process all official rankings
  FOR ranking_record IN 
    SELECT id FROM public.official_rankings 
    WHERE (target_ranking_id IS NULL OR id = target_ranking_id)
  LOOP
    -- First, set all positions to negative values to avoid conflicts
    UPDATE public.ranking_items 
    SET position = -position
    WHERE ranking_id = ranking_record.id;
    
    new_position := 1;
    
    -- Update positions based on vote count (descending) then alphabetical order
    FOR item_record IN
      SELECT 
        ri.id,
        ri.ranking_id,
        ri.rapper_id,
        r.name,
        COALESCE(vote_totals.total_votes, 0) as vote_count
      FROM public.ranking_items ri
      JOIN public.rappers r ON ri.rapper_id = r.id
      LEFT JOIN (
        SELECT 
          rapper_id,
          SUM(vote_weight) as total_votes
        FROM public.ranking_votes 
        WHERE ranking_id = ranking_record.id
        GROUP BY rapper_id
      ) vote_totals ON ri.rapper_id = vote_totals.rapper_id
      WHERE ri.ranking_id = ranking_record.id
      ORDER BY 
        COALESCE(vote_totals.total_votes, 0) DESC,
        r.name ASC
    LOOP
      -- Update the position for this item
      UPDATE public.ranking_items 
      SET position = new_position,
          updated_at = NOW()
      WHERE id = item_record.id;
      
      new_position := new_position + 1;
    END LOOP;
    
    RAISE NOTICE 'Updated positions for ranking %', ranking_record.id;
  END LOOP;
END;
$$;

-- Create function to populate all rankings with missing rappers
CREATE OR REPLACE FUNCTION public.populate_all_rankings_with_missing_rappers()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ranking_record RECORD;
  rapper_count INTEGER;
  missing_count INTEGER;
BEGIN
  -- Get total rapper count for reference
  SELECT COUNT(*) INTO rapper_count FROM public.rappers;
  
  -- Process each official ranking
  FOR ranking_record IN SELECT id, title FROM public.official_rankings LOOP
    -- Count existing rappers in this ranking
    SELECT COUNT(*) INTO missing_count
    FROM public.rappers r
    WHERE NOT EXISTS (
      SELECT 1 FROM public.ranking_items ri 
      WHERE ri.ranking_id = ranking_record.id AND ri.rapper_id = r.id
    );
    
    IF missing_count > 0 THEN
      -- Populate missing rappers
      PERFORM public.populate_ranking_with_all_rappers(ranking_record.id);
      RAISE NOTICE 'Added % missing rappers to ranking: %', missing_count, ranking_record.title;
    END IF;
  END LOOP;
  
  -- Process each user ranking
  FOR ranking_record IN SELECT id, title FROM public.user_rankings LOOP
    -- Count existing rappers in this ranking
    SELECT COUNT(*) INTO missing_count
    FROM public.rappers r
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_ranking_items uri 
      WHERE uri.ranking_id = ranking_record.id AND uri.rapper_id = r.id
    );
    
    IF missing_count > 0 THEN
      -- Populate missing rappers
      PERFORM public.populate_user_ranking_with_all_rappers(ranking_record.id);
      RAISE NOTICE 'Added % missing rappers to user ranking: %', missing_count, ranking_record.title;
    END IF;
  END LOOP;
END;
$$;

-- Create comprehensive daily maintenance function
CREATE OR REPLACE FUNCTION public.daily_ranking_maintenance()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RAISE NOTICE 'Starting daily ranking maintenance at %', NOW();
  
  -- Step 1: Populate missing rappers in all rankings
  PERFORM public.populate_all_rankings_with_missing_rappers();
  
  -- Step 2: Recalculate positions for all rankings
  PERFORM public.recalculate_ranking_positions();
  
  RAISE NOTICE 'Completed daily ranking maintenance at %', NOW();
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Daily ranking maintenance failed: %', SQLERRM;
END;
$$;

-- Run immediate fix for current issues
-- First populate missing rappers
SELECT public.populate_all_rankings_with_missing_rappers();

-- Then recalculate all positions to fix alphabetical sorting
SELECT public.recalculate_ranking_positions();

-- Re-add the unique constraint after positions are fixed
ALTER TABLE public.ranking_items ADD CONSTRAINT ranking_items_ranking_id_position_key UNIQUE (ranking_id, position);
