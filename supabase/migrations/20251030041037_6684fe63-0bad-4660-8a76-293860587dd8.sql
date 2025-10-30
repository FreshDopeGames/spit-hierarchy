-- Create the clean_official_ranking_items function with correct table names
CREATE OR REPLACE FUNCTION clean_official_ranking_items(
  ranking_uuid UUID,
  filter_criteria JSONB
)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
  decades_array TEXT[];
  locations_array TEXT[];
  tag_ids_array UUID[];
  artist_types_array TEXT[];
  group_tag_id UUID := '423c7cec-44c3-4e9f-a87e-980206cbf989'::UUID;
BEGIN
  -- Extract filter arrays from JSONB
  decades_array := COALESCE(
    ARRAY(SELECT jsonb_array_elements_text(filter_criteria->'decades')),
    ARRAY[]::TEXT[]
  );
  locations_array := COALESCE(
    ARRAY(SELECT jsonb_array_elements_text(filter_criteria->'locations')),
    ARRAY[]::TEXT[]
  );
  tag_ids_array := COALESCE(
    ARRAY(SELECT (jsonb_array_elements_text(filter_criteria->'tag_ids'))::UUID),
    ARRAY[]::UUID[]
  );
  artist_types_array := COALESCE(
    ARRAY(SELECT jsonb_array_elements_text(filter_criteria->'artist_types')),
    ARRAY[]::TEXT[]
  );

  -- Delete ranking_items that don't match the filter criteria
  WITH to_delete AS (
    DELETE FROM ranking_items ri
    WHERE ri.ranking_id = ranking_uuid
    AND NOT EXISTS (
      SELECT 1 FROM rappers r
      WHERE r.id = ri.rapper_id
      AND (
        -- No filters = include all
        (array_length(decades_array, 1) IS NULL 
         AND array_length(locations_array, 1) IS NULL 
         AND array_length(tag_ids_array, 1) IS NULL 
         AND array_length(artist_types_array, 1) IS NULL)
        OR
        -- Has filters = must match all non-empty filters
        (
          -- Decade filter (group-aware logic)
          (array_length(decades_array, 1) IS NULL OR 
           EXISTS (
             SELECT 1 FROM unnest(decades_array) AS decade
             WHERE 
               CASE 
                 -- For groups: check birth_year (formation year) OR career_start_year
                 WHEN EXISTS (SELECT 1 FROM rapper_tag_assignments rta WHERE rta.rapper_id = r.id AND rta.tag_id = group_tag_id) THEN
                   (r.birth_year >= (SUBSTRING(decade, 1, 4)::INT) AND 
                    r.birth_year <= (SUBSTRING(decade, 1, 4)::INT + 9))
                   OR
                   (r.career_start_year >= (SUBSTRING(decade, 1, 4)::INT) AND 
                    r.career_start_year <= (SUBSTRING(decade, 1, 4)::INT + 9))
                 -- For solo artists: only check career_start_year
                 ELSE
                   r.career_start_year >= (SUBSTRING(decade, 1, 4)::INT) AND 
                   r.career_start_year <= (SUBSTRING(decade, 1, 4)::INT + 9)
               END
           ))
          AND
          -- Location filter (no column found, skipping)
          (array_length(locations_array, 1) IS NULL)
          AND
          -- Tag filter
          (array_length(tag_ids_array, 1) IS NULL OR 
           EXISTS (SELECT 1 FROM rapper_tag_assignments rta WHERE rta.rapper_id = r.id AND rta.tag_id = ANY(tag_ids_array)))
          AND
          -- Artist type filter (using group tag)
          (array_length(artist_types_array, 1) IS NULL OR 
           (
             ('group' = ANY(artist_types_array) AND EXISTS (SELECT 1 FROM rapper_tag_assignments rta WHERE rta.rapper_id = r.id AND rta.tag_id = group_tag_id))
             OR
             ('solo' = ANY(artist_types_array) AND NOT EXISTS (SELECT 1 FROM rapper_tag_assignments rta WHERE rta.rapper_id = r.id AND rta.tag_id = group_tag_id))
           ))
        )
      )
    )
    RETURNING *
  )
  SELECT COUNT(*)::INTEGER INTO deleted_count FROM to_delete;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now execute the cleanup, repopulation, and recalculation for Top 80s Rappers
SELECT clean_official_ranking_items(
  'f43cde5f-9930-4456-8e45-b023aafa3223'::UUID,
  '{"decades":["1980s"],"locations":[],"tag_ids":[],"artist_types":[]}'::jsonb
);

SELECT populate_ranking_with_rappers(
  'f43cde5f-9930-4456-8e45-b023aafa3223'::UUID,
  '{"decades":["1980s"],"locations":[],"tag_ids":[],"artist_types":[]}'::jsonb
);

SELECT recalculate_ranking_positions('f43cde5f-9930-4456-8e45-b023aafa3223'::UUID);