-- Create optimized function to get album details by slugs in a single query
CREATE OR REPLACE FUNCTION public.get_album_by_slugs(
  p_rapper_slug text,
  p_album_slug text
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_result jsonb;
  v_rapper_id uuid;
  v_album_id uuid;
  v_rapper_name text;
  v_rapper_slug text;
  v_album_details jsonb;
BEGIN
  -- Get rapper info by slug
  SELECT id, name, slug INTO v_rapper_id, v_rapper_name, v_rapper_slug
  FROM public.rappers
  WHERE slug = p_rapper_slug;
  
  IF v_rapper_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Rapper not found'
    );
  END IF;
  
  -- Get album info by slug and verify it belongs to this rapper
  SELECT a.id INTO v_album_id
  FROM public.albums a
  INNER JOIN public.rapper_albums ra ON a.id = ra.album_id
  WHERE a.slug = p_album_slug
    AND ra.rapper_id = v_rapper_id;
  
  IF v_album_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Album not found for this rapper'
    );
  END IF;
  
  -- Get full album details with tracks
  SELECT jsonb_agg(row_to_json(t.*)) INTO v_album_details
  FROM public.get_album_with_tracks(v_album_id) t;
  
  IF v_album_details IS NULL OR jsonb_array_length(v_album_details) = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Album details not found'
    );
  END IF;
  
  -- Combine all data into single result
  v_result := jsonb_build_object(
    'success', true,
    'rapper_id', v_rapper_id,
    'rapper_name', v_rapper_name,
    'rapper_slug', v_rapper_slug,
    'album', v_album_details->0
  );
  
  RETURN v_result;
END;
$function$;