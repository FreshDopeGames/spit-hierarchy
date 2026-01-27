-- Fix decade filtering for official rankings
-- Use first album release year instead of birth_year/career_start_year

-- Update populate_ranking_with_rappers function
CREATE OR REPLACE FUNCTION populate_ranking_with_rappers(
  ranking_uuid uuid,
  filter_criteria jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rapper_record RECORD;
  current_position INTEGER := 1;
  decades_array text[];
  locations_array text[];
  artist_types_array text[];
  tag_ids_array uuid[];
BEGIN
  -- Extract filter criteria arrays
  decades_array := ARRAY(SELECT jsonb_array_elements_text(filter_criteria->'decades'));
  locations_array := ARRAY(SELECT jsonb_array_elements_text(filter_criteria->'locations'));
  artist_types_array := ARRAY(SELECT jsonb_array_elements_text(filter_criteria->'artist_types'));
  tag_ids_array := ARRAY(SELECT (jsonb_array_elements_text(filter_criteria->'tag_ids'))::uuid);
  
  -- Delete existing items for this ranking to start fresh
  DELETE FROM ranking_items WHERE ranking_id = ranking_uuid;
  
  -- Insert rappers that match ALL filter criteria
  FOR rapper_record IN 
    SELECT DISTINCT r.id, r.name
    FROM rappers r
    LEFT JOIN rapper_tag_assignments rta ON r.id = rta.rapper_id
    LEFT JOIN rapper_tags rt ON rta.tag_id = rt.id AND rt.slug = 'group'
    WHERE (
      -- Artist type filter: if specified, rapper must match
      (artist_types_array IS NULL OR array_length(artist_types_array, 1) IS NULL)
      OR 
      (
        ('group' = ANY(artist_types_array) AND rt.id IS NOT NULL) OR
        ('solo' = ANY(artist_types_array) AND rt.id IS NULL)
      )
    )
    AND (
      -- Decade filter: use FIRST ALBUM RELEASE YEAR from discography
      (decades_array IS NULL OR array_length(decades_array, 1) IS NULL)
      OR
      EXISTS (
        SELECT 1
        FROM rapper_albums ra
        JOIN albums a ON ra.album_id = a.id
        WHERE ra.rapper_id = r.id
          AND a.release_date IS NOT NULL
        GROUP BY ra.rapper_id
        HAVING (
          ('1980s' = ANY(decades_array) AND MIN(EXTRACT(YEAR FROM a.release_date)::INT) BETWEEN 1980 AND 1989) OR
          ('1990s' = ANY(decades_array) AND MIN(EXTRACT(YEAR FROM a.release_date)::INT) BETWEEN 1990 AND 1999) OR
          ('2000s' = ANY(decades_array) AND MIN(EXTRACT(YEAR FROM a.release_date)::INT) BETWEEN 2000 AND 2009) OR
          ('2010s' = ANY(decades_array) AND MIN(EXTRACT(YEAR FROM a.release_date)::INT) BETWEEN 2010 AND 2019) OR
          ('2020s' = ANY(decades_array) AND MIN(EXTRACT(YEAR FROM a.release_date)::INT) BETWEEN 2020 AND 2029)
        )
      )
    )
    AND (
      -- Location filter: exact match on origin
      (locations_array IS NULL OR array_length(locations_array, 1) IS NULL)
      OR r.origin = ANY(locations_array)
    )
    AND (
      -- Tag filter: rapper must have at least one of the specified tags
      (tag_ids_array IS NULL OR array_length(tag_ids_array, 1) IS NULL)
      OR EXISTS (
        SELECT 1 FROM rapper_tag_assignments rta2
        WHERE rta2.rapper_id = r.id AND rta2.tag_id = ANY(tag_ids_array)
      )
    )
    ORDER BY r.name
  LOOP
    INSERT INTO ranking_items (ranking_id, rapper_id, position, is_ranked)
    VALUES (ranking_uuid, rapper_record.id, current_position, FALSE);
    
    current_position := current_position + 1;
  END LOOP;
  
  RAISE NOTICE 'Populated ranking % with % rappers', ranking_uuid, current_position - 1;
END;
$$;

-- Update clean_official_ranking_items function to use same first-album-year logic
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
          -- Decade filter: use FIRST ALBUM RELEASE YEAR
          (array_length(decades_array, 1) IS NULL OR 
           EXISTS (
             SELECT 1 FROM unnest(decades_array) AS decade
             WHERE EXISTS (
               SELECT 1
               FROM rapper_albums ra
               JOIN albums a ON ra.album_id = a.id
               WHERE ra.rapper_id = r.id
                 AND a.release_date IS NOT NULL
               GROUP BY ra.rapper_id
               HAVING MIN(EXTRACT(YEAR FROM a.release_date)::INT) 
                      BETWEEN (SUBSTRING(decade, 1, 4)::INT) AND (SUBSTRING(decade, 1, 4)::INT + 9)
             )
           ))
          AND
          -- Location filter
          (array_length(locations_array, 1) IS NULL OR r.origin = ANY(locations_array))
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

-- Repopulate all official rankings with the corrected decade filtering logic
DO $$
DECLARE
  ranking_record RECORD;
  rappers_added INTEGER;
BEGIN
  RAISE NOTICE 'Starting repopulation of all official rankings with fixed decade filtering...';
  
  FOR ranking_record IN 
    SELECT id, title, filter_criteria 
    FROM official_rankings 
    ORDER BY title
  LOOP
    RAISE NOTICE 'Processing ranking: % (filter_criteria: %)', ranking_record.title, ranking_record.filter_criteria;
    
    -- Repopulate this ranking with filtered rappers
    PERFORM populate_ranking_with_rappers(
      ranking_record.id, 
      COALESCE(ranking_record.filter_criteria, '{}'::jsonb)
    );
    
    -- Get count of rappers added
    SELECT COUNT(*) INTO rappers_added
    FROM ranking_items
    WHERE ranking_id = ranking_record.id;
    
    RAISE NOTICE '✓ Ranking "%": % rappers added', ranking_record.title, rappers_added;
  END LOOP;
  
  RAISE NOTICE 'Successfully completed repopulation of all rankings with fixed decade filtering!';
END $$;