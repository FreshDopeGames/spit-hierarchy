-- Drop and recreate the populate_ranking_with_rappers function with proper filter handling
DROP FUNCTION IF EXISTS populate_ranking_with_rappers(uuid, jsonb);

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
BEGIN
  -- Extract filter criteria arrays
  decades_array := ARRAY(SELECT jsonb_array_elements_text(filter_criteria->'decades'));
  locations_array := ARRAY(SELECT jsonb_array_elements_text(filter_criteria->'locations'));
  artist_types_array := ARRAY(SELECT jsonb_array_elements_text(filter_criteria->'artist_types'));
  
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
      -- Decade filter: check both birth_year and career_start_year
      (decades_array IS NULL OR array_length(decades_array, 1) IS NULL)
      OR
      (
        ('1980s' = ANY(decades_array) AND (r.birth_year BETWEEN 1980 AND 1989 OR r.career_start_year BETWEEN 1980 AND 1989)) OR
        ('1990s' = ANY(decades_array) AND (r.birth_year BETWEEN 1990 AND 1999 OR r.career_start_year BETWEEN 1990 AND 1999)) OR
        ('2000s' = ANY(decades_array) AND (r.birth_year BETWEEN 2000 AND 2009 OR r.career_start_year BETWEEN 2000 AND 2009)) OR
        ('2010s' = ANY(decades_array) AND (r.birth_year BETWEEN 2010 AND 2019 OR r.career_start_year BETWEEN 2010 AND 2019)) OR
        ('2020s' = ANY(decades_array) AND (r.birth_year BETWEEN 2020 AND 2029 OR r.career_start_year BETWEEN 2020 AND 2029))
      )
    )
    AND (
      -- Location filter: exact match on origin
      (locations_array IS NULL OR array_length(locations_array, 1) IS NULL)
      OR r.origin = ANY(locations_array)
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

-- Repopulate ALL official rankings with their filtered rappers
DO $$
DECLARE
  ranking_record RECORD;
  rappers_added INTEGER;
BEGIN
  RAISE NOTICE 'Starting repopulation of all official rankings...';
  
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
  
  RAISE NOTICE 'Successfully completed repopulation of all rankings!';
END $$;