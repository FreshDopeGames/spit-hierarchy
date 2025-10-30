-- Update populate_ranking_with_rappers to handle groups vs solo artists for decade filtering
-- For groups: use birth_year (formation) OR career_start_year
-- For solo artists: use only career_start_year

CREATE OR REPLACE FUNCTION public.populate_ranking_with_rappers(
  ranking_uuid uuid,
  location_filter text[] DEFAULT NULL,
  tag_filter text[] DEFAULT NULL,
  decade_filter text[] DEFAULT NULL,
  artist_type_filter text[] DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  rapper_record RECORD;
  current_position INTEGER := 1;
  max_existing_position INTEGER := 0;
BEGIN
  -- Get the highest existing position for this ranking
  SELECT COALESCE(MAX(position), 0) INTO max_existing_position
  FROM public.ranking_items
  WHERE ranking_id = ranking_uuid;
  
  -- Set starting position after existing items
  current_position := max_existing_position + 1;
  
  -- Build dynamic query with all filters
  FOR rapper_record IN 
    SELECT DISTINCT r.id 
    FROM public.rappers r 
    LEFT JOIN public.rapper_tag_assignments rta ON r.id = rta.rapper_id
    LEFT JOIN public.rapper_tags rt ON rta.tag_id = rt.id
    WHERE NOT EXISTS (
      SELECT 1 FROM public.ranking_items ri 
      WHERE ri.ranking_id = ranking_uuid AND ri.rapper_id = r.id
    )
    -- Location filter
    AND (location_filter IS NULL OR r.origin = ANY(location_filter))
    -- Tag filter  
    AND (tag_filter IS NULL OR rt.slug = ANY(tag_filter))
    -- Decade filter with group detection
    AND (
      decade_filter IS NULL OR
      -- 1980s
      ('1980s' = ANY(decade_filter) AND (
        -- For groups: use birth_year (formation) OR career_start_year
        (EXISTS (
          SELECT 1 FROM public.rapper_tag_assignments rta_check
          JOIN public.rapper_tags rt_check ON rta_check.tag_id = rt_check.id
          WHERE rta_check.rapper_id = r.id AND rt_check.slug = 'group'
        ) AND (r.birth_year BETWEEN 1980 AND 1989 OR r.career_start_year BETWEEN 1980 AND 1989))
        OR
        -- For solo artists: use only career_start_year
        (NOT EXISTS (
          SELECT 1 FROM public.rapper_tag_assignments rta_check
          JOIN public.rapper_tags rt_check ON rta_check.tag_id = rt_check.id
          WHERE rta_check.rapper_id = r.id AND rt_check.slug = 'group'
        ) AND r.career_start_year BETWEEN 1980 AND 1989)
      )) OR
      -- 1990s
      ('1990s' = ANY(decade_filter) AND (
        (EXISTS (
          SELECT 1 FROM public.rapper_tag_assignments rta_check
          JOIN public.rapper_tags rt_check ON rta_check.tag_id = rt_check.id
          WHERE rta_check.rapper_id = r.id AND rt_check.slug = 'group'
        ) AND (r.birth_year BETWEEN 1990 AND 1999 OR r.career_start_year BETWEEN 1990 AND 1999))
        OR
        (NOT EXISTS (
          SELECT 1 FROM public.rapper_tag_assignments rta_check
          JOIN public.rapper_tags rt_check ON rta_check.tag_id = rt_check.id
          WHERE rta_check.rapper_id = r.id AND rt_check.slug = 'group'
        ) AND r.career_start_year BETWEEN 1990 AND 1999)
      )) OR
      -- 2000s
      ('2000s' = ANY(decade_filter) AND (
        (EXISTS (
          SELECT 1 FROM public.rapper_tag_assignments rta_check
          JOIN public.rapper_tags rt_check ON rta_check.tag_id = rt_check.id
          WHERE rta_check.rapper_id = r.id AND rt_check.slug = 'group'
        ) AND (r.birth_year BETWEEN 2000 AND 2009 OR r.career_start_year BETWEEN 2000 AND 2009))
        OR
        (NOT EXISTS (
          SELECT 1 FROM public.rapper_tag_assignments rta_check
          JOIN public.rapper_tags rt_check ON rta_check.tag_id = rt_check.id
          WHERE rta_check.rapper_id = r.id AND rt_check.slug = 'group'
        ) AND r.career_start_year BETWEEN 2000 AND 2009)
      )) OR
      -- 2010s
      ('2010s' = ANY(decade_filter) AND (
        (EXISTS (
          SELECT 1 FROM public.rapper_tag_assignments rta_check
          JOIN public.rapper_tags rt_check ON rta_check.tag_id = rt_check.id
          WHERE rta_check.rapper_id = r.id AND rt_check.slug = 'group'
        ) AND (r.birth_year BETWEEN 2010 AND 2019 OR r.career_start_year BETWEEN 2010 AND 2019))
        OR
        (NOT EXISTS (
          SELECT 1 FROM public.rapper_tag_assignments rta_check
          JOIN public.rapper_tags rt_check ON rta_check.tag_id = rt_check.id
          WHERE rta_check.rapper_id = r.id AND rt_check.slug = 'group'
        ) AND r.career_start_year BETWEEN 2010 AND 2019)
      )) OR
      -- 2020s
      ('2020s' = ANY(decade_filter) AND (
        (EXISTS (
          SELECT 1 FROM public.rapper_tag_assignments rta_check
          JOIN public.rapper_tags rt_check ON rta_check.tag_id = rt_check.id
          WHERE rta_check.rapper_id = r.id AND rt_check.slug = 'group'
        ) AND (r.birth_year BETWEEN 2020 AND 2029 OR r.career_start_year BETWEEN 2020 AND 2029))
        OR
        (NOT EXISTS (
          SELECT 1 FROM public.rapper_tag_assignments rta_check
          JOIN public.rapper_tags rt_check ON rta_check.tag_id = rt_check.id
          WHERE rta_check.rapper_id = r.id AND rt_check.slug = 'group'
        ) AND r.career_start_year BETWEEN 2020 AND 2029)
      ))
    )
    -- Artist type filter (solo/group)
    AND (
      artist_type_filter IS NULL OR
      ('solo' = ANY(artist_type_filter) AND NOT EXISTS (
        SELECT 1 FROM public.rapper_tag_assignments rta_type
        JOIN public.rapper_tags rt_type ON rta_type.tag_id = rt_type.id
        WHERE rta_type.rapper_id = r.id AND rt_type.slug = 'group'
      )) OR
      ('group' = ANY(artist_type_filter) AND EXISTS (
        SELECT 1 FROM public.rapper_tag_assignments rta_type
        JOIN public.rapper_tags rt_type ON rta_type.tag_id = rt_type.id
        WHERE rta_type.rapper_id = r.id AND rt_type.slug = 'group'
      ))
    )
    ORDER BY r.name
  LOOP
    INSERT INTO public.ranking_items (ranking_id, rapper_id, position, is_ranked)
    VALUES (ranking_uuid, rapper_record.id, current_position, FALSE);
    
    current_position := current_position + 1;
  END LOOP;
END;
$function$;