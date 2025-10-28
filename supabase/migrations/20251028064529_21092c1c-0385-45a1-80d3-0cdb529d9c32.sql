CREATE OR REPLACE FUNCTION populate_ranking_with_rappers(
  ranking_uuid UUID,
  filter_criteria JSONB DEFAULT '{}'::jsonb
) RETURNS INTEGER AS $$
DECLARE
  inserted_count INTEGER := 0;
  rapper_record RECORD;
  location_filter TEXT[];
  decade_filter TEXT[];
  artist_type_filter TEXT[];
  tag_filter UUID[];
  current_position INTEGER := 0;
  rows_affected INTEGER;
BEGIN
  location_filter := ARRAY(SELECT jsonb_array_elements_text(filter_criteria->'locations'));
  decade_filter := ARRAY(SELECT jsonb_array_elements_text(filter_criteria->'decades'));
  artist_type_filter := ARRAY(SELECT jsonb_array_elements_text(filter_criteria->'artist_types'));
  tag_filter := ARRAY(SELECT (jsonb_array_elements_text(filter_criteria->'tag_ids'))::UUID);
  
  FOR rapper_record IN 
    SELECT DISTINCT r.id, r.name
    FROM rappers r
    LEFT JOIN rapper_tag_assignments rta ON r.id = rta.rapper_id
    WHERE 
      (location_filter IS NULL OR cardinality(location_filter) = 0 OR r.origin = ANY(location_filter))
      AND (
        decade_filter IS NULL OR cardinality(decade_filter) = 0 OR
        (
          ('1980s' = ANY(decade_filter) AND (r.birth_year BETWEEN 1980 AND 1989 OR r.career_start_year BETWEEN 1980 AND 1989)) OR
          ('1990s' = ANY(decade_filter) AND (r.birth_year BETWEEN 1990 AND 1999 OR r.career_start_year BETWEEN 1990 AND 1999)) OR
          ('2000s' = ANY(decade_filter) AND (r.birth_year BETWEEN 2000 AND 2009 OR r.career_start_year BETWEEN 2000 AND 2009)) OR
          ('2010s' = ANY(decade_filter) AND (r.birth_year BETWEEN 2010 AND 2019 OR r.career_start_year BETWEEN 2010 AND 2019)) OR
          ('2020s' = ANY(decade_filter) AND (r.birth_year BETWEEN 2020 AND 2029 OR r.career_start_year BETWEEN 2020 AND 2029))
        )
      )
      AND (
        tag_filter IS NULL OR cardinality(tag_filter) = 0 OR
        rta.tag_id = ANY(tag_filter)
      )
    ORDER BY r.name
  LOOP
    IF artist_type_filter IS NOT NULL AND cardinality(artist_type_filter) > 0 THEN
      IF 'group' = ANY(artist_type_filter) THEN
        IF NOT EXISTS (
          SELECT 1 FROM rapper_tag_assignments rta2
          JOIN rapper_tags rt ON rta2.tag_id = rt.id
          WHERE rta2.rapper_id = rapper_record.id AND rt.slug = 'group'
        ) AND 'solo' != ANY(artist_type_filter) THEN
          CONTINUE;
        END IF;
      END IF;
      
      IF 'solo' = ANY(artist_type_filter) THEN
        IF EXISTS (
          SELECT 1 FROM rapper_tag_assignments rta2
          JOIN rapper_tags rt ON rta2.tag_id = rt.id
          WHERE rta2.rapper_id = rapper_record.id AND rt.slug = 'group'
        ) AND 'group' != ANY(artist_type_filter) THEN
          CONTINUE;
        END IF;
      END IF;
    END IF;
    
    SELECT COALESCE(MAX(position), 0) + 1 INTO current_position
    FROM ranking_items
    WHERE ranking_id = ranking_uuid;
    
    INSERT INTO ranking_items (ranking_id, rapper_id, position, is_ranked)
    VALUES (ranking_uuid, rapper_record.id, current_position, false)
    ON CONFLICT (ranking_id, rapper_id) DO NOTHING;
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    inserted_count := inserted_count + rows_affected;
  END LOOP;
  
  RETURN inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;