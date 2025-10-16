-- Fix community ranking positions to allow true ties using DENSE_RANK on vote weight only
BEGIN;

CREATE OR REPLACE FUNCTION public.update_user_ranking_positions(ranking_uuid UUID)
RETURNS void AS $$
BEGIN
  -- Step 1: Temporarily negate all positions to avoid any transient conflicts
  UPDATE public.user_ranking_items
  SET position = -position
  WHERE ranking_id = ranking_uuid;
  
  -- Step 2: Compute ranks based ONLY on total vote weight (true ties)
  WITH vote_ranks AS (
    SELECT DISTINCT
      COALESCE(urvc.total_vote_weight, 0) AS vote_weight,
      DENSE_RANK() OVER (
        ORDER BY COALESCE(urvc.total_vote_weight, 0) DESC
      ) AS vote_rank
    FROM public.user_ranking_items uri
    LEFT JOIN public.user_ranking_vote_counts urvc 
      ON uri.ranking_id = urvc.user_ranking_id 
      AND uri.rapper_id = urvc.rapper_id
    WHERE uri.ranking_id = ranking_uuid
  ),
  ranked_items AS (
    SELECT 
      uri.id,
      vr.vote_rank AS new_position,
      COALESCE(urvc.total_vote_weight, 0) AS vote_weight,
      r.name AS rapper_name
    FROM public.user_ranking_items uri
    INNER JOIN public.rappers r ON uri.rapper_id = r.id
    LEFT JOIN public.user_ranking_vote_counts urvc 
      ON uri.ranking_id = urvc.user_ranking_id 
      AND uri.rapper_id = urvc.rapper_id
    LEFT JOIN vote_ranks vr ON COALESCE(urvc.total_vote_weight, 0) = vr.vote_weight
    WHERE uri.ranking_id = ranking_uuid
    -- Display order: by vote weight desc then alphabetical, but rank is from vote_ranks only
    ORDER BY 
      COALESCE(urvc.total_vote_weight, 0) DESC,
      r.name ASC
  )
  UPDATE public.user_ranking_items uri
  SET 
    position = ri.new_position,
    updated_at = NOW()
  FROM ranked_items ri
  WHERE uri.id = ri.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMIT;

-- Apply to Soundtrack Heroes
REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_ranking_vote_counts;
SELECT public.update_user_ranking_positions('80aee6db-fe6f-4a68-b0c2-3760ac28493c');