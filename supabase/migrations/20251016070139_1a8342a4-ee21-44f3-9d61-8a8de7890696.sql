-- Create the missing position update function with conflict-free updates
CREATE OR REPLACE FUNCTION public.update_user_ranking_positions(ranking_uuid UUID)
RETURNS void AS $$
BEGIN
  -- Step 1: Temporarily negate all positions to avoid unique constraint conflicts
  UPDATE public.user_ranking_items
  SET position = -position
  WHERE ranking_id = ranking_uuid;
  
  -- Step 2: Calculate and apply new positions
  WITH ranked_items AS (
    SELECT 
      uri.id,
      uri.rapper_id,
      r.name as rapper_name,
      COALESCE(urvc.total_vote_weight, 0) as vote_weight,
      ROW_NUMBER() OVER (
        ORDER BY 
          COALESCE(urvc.total_vote_weight, 0) DESC,
          r.name ASC  -- Tie-breaker: alphabetical by name
      ) as new_position
    FROM public.user_ranking_items uri
    INNER JOIN public.rappers r ON uri.rapper_id = r.id
    LEFT JOIN public.user_ranking_vote_counts urvc 
      ON uri.ranking_id = urvc.user_ranking_id 
      AND uri.rapper_id = urvc.rapper_id
    WHERE uri.ranking_id = ranking_uuid
  )
  UPDATE public.user_ranking_items uri
  SET 
    position = ri.new_position,
    updated_at = NOW()
  FROM ranked_items ri
  WHERE uri.id = ri.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update the trigger function to call position update after refreshing vote counts
CREATE OR REPLACE FUNCTION public.refresh_user_ranking_vote_counts()
RETURNS TRIGGER AS $$
DECLARE
  affected_ranking_id UUID;
BEGIN
  -- Determine which ranking was affected
  IF TG_OP = 'DELETE' THEN
    affected_ranking_id := OLD.user_ranking_id;
  ELSE
    affected_ranking_id := NEW.user_ranking_id;
  END IF;
  
  -- Refresh the materialized view
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_ranking_vote_counts;
  
  -- Update positions for the affected ranking
  PERFORM public.update_user_ranking_positions(affected_ranking_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Manually trigger position update for the "Soundtrack Heroes" ranking
SELECT public.update_user_ranking_positions('80aee6db-fe6f-4a68-b0c2-3760ac28493c');