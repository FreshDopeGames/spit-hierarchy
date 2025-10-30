-- Phase 4: Re-clean and re-populate all decade rankings
DO $$
DECLARE
  ranking_80s UUID := 'f43cde5f-9930-4456-8e45-b023aafa3223'; -- Top 80s Rappers
  ranking_90s UUID := '83c9c3d8-6c54-44f6-9e74-6f05c5e8b0dc'; -- Top 90s Rappers
BEGIN
  -- Clean Top 80s Rappers
  PERFORM clean_official_ranking_items(
    ranking_80s,
    '{"decades":["1980s"],"locations":[],"tag_ids":[],"artist_types":[]}'::jsonb
  );
  
  -- Re-populate Top 80s Rappers
  PERFORM populate_ranking_with_rappers(
    ranking_80s,
    '{"decades":["1980s"],"locations":[],"tag_ids":[],"artist_types":[]}'::jsonb
  );
  
  -- Recalculate positions for Top 80s Rappers
  PERFORM recalculate_ranking_positions(ranking_80s);
  
  RAISE NOTICE 'Cleaned and repopulated Top 80s Rappers';
  
  -- Clean Top 90s Rappers
  PERFORM clean_official_ranking_items(
    ranking_90s,
    '{"decades":["1990s"],"locations":[],"tag_ids":[],"artist_types":[]}'::jsonb
  );
  
  -- Re-populate Top 90s Rappers
  PERFORM populate_ranking_with_rappers(
    ranking_90s,
    '{"decades":["1990s"],"locations":[],"tag_ids":[],"artist_types":[]}'::jsonb
  );
  
  -- Recalculate positions for Top 90s Rappers
  PERFORM recalculate_ranking_positions(ranking_90s);
  
  RAISE NOTICE 'Cleaned and repopulated Top 90s Rappers';
END $$;

-- Verify results
SELECT 
  'Top 80s Rappers - Invalid Count' as check_name,
  COUNT(*) as count
FROM ranking_items ri
JOIN rappers r ON ri.rapper_id = r.id
LEFT JOIN rapper_tag_assignments rta ON r.id = rta.rapper_id AND rta.tag_id = '423c7cec-44c3-4e9f-a87e-980206cbf989'
WHERE ri.ranking_id = 'f43cde5f-9930-4456-8e45-b023aafa3223'
  AND (
    (rta.rapper_id IS NULL AND (r.career_start_year IS NULL OR r.career_start_year < 1980 OR r.career_start_year > 1989))
    OR (rta.rapper_id IS NOT NULL AND (r.birth_year IS NULL OR (r.birth_year < 1980 AND (r.career_start_year IS NULL OR r.career_start_year < 1980)) OR (r.birth_year > 1989 AND (r.career_start_year IS NULL OR r.career_start_year > 1989))))
  )

UNION ALL

SELECT 
  'Top 90s Rappers - Invalid Count' as check_name,
  COUNT(*) as count
FROM ranking_items ri
JOIN rappers r ON ri.rapper_id = r.id
LEFT JOIN rapper_tag_assignments rta ON r.id = rta.rapper_id AND rta.tag_id = '423c7cec-44c3-4e9f-a87e-980206cbf989'
WHERE ri.ranking_id = '83c9c3d8-6c54-44f6-9e74-6f05c5e8b0dc'
  AND (
    (rta.rapper_id IS NULL AND (r.career_start_year IS NULL OR r.career_start_year < 1990 OR r.career_start_year > 1999))
    OR (rta.rapper_id IS NOT NULL AND (r.birth_year IS NULL OR (r.birth_year < 1990 AND (r.career_start_year IS NULL OR r.career_start_year < 1990)) OR (r.birth_year > 1999 AND (r.career_start_year IS NULL OR r.career_start_year > 1999))))
  );