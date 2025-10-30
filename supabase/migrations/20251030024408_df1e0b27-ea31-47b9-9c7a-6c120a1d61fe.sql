-- Fix recalculate_ranking_positions to use stable ordering for non-ranked rappers
-- Replace NOW() with fixed date and add alphabetical sorting

CREATE OR REPLACE FUNCTION public.recalculate_ranking_positions(target_ranking_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
    
    -- Update positions based on vote count (descending), then earliest first vote for tie-breaking,
    -- then alphabetically by name for stable ordering of 0-vote rappers
    FOR item_record IN
      SELECT 
        ri.id,
        ri.ranking_id,
        ri.rapper_id,
        r.name,
        COALESCE(vote_totals.total_votes, 0) as vote_count,
        COALESCE(vote_totals.earliest_vote, '9999-12-31'::timestamp) as earliest_vote
      FROM public.ranking_items ri
      JOIN public.rappers r ON ri.rapper_id = r.id
      LEFT JOIN (
        SELECT 
          rapper_id,
          SUM(vote_weight) as total_votes,
          MIN(created_at) as earliest_vote
        FROM public.ranking_votes 
        WHERE ranking_id = ranking_record.id
        GROUP BY rapper_id
      ) vote_totals ON ri.rapper_id = vote_totals.rapper_id
      WHERE ri.ranking_id = ranking_record.id
      ORDER BY 
        COALESCE(vote_totals.total_votes, 0) DESC,
        COALESCE(vote_totals.earliest_vote, '9999-12-31'::timestamp) ASC,
        r.name ASC  -- Stable alphabetical ordering for rappers with same vote count
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
$function$;

-- Run the function to immediately fix current positions
SELECT public.recalculate_ranking_positions();