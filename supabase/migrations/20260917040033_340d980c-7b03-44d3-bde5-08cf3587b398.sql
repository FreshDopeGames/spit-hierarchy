-- Helper: re-sort unranked items alphabetically within one official ranking (two-phase to respect unique position constraint)
CREATE OR REPLACE FUNCTION public.resort_ranking_unranked_alphabetically(p_ranking_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 VOLATILE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Phase 1: move unranked positions into negative space (order preserved)
  UPDATE public.ranking_items
  SET position = -position
  WHERE ranking_id = p_ranking_id AND is_ranked = FALSE AND position > 0;

  -- Phase 2: assign alphabetically. Negative positions: original ascending = descending numeric order
  WITH unranked AS (
    SELECT ri.id, ri.position,
           ROW_NUMBER() OVER (ORDER BY r.name) AS name_order,
           ROW_NUMBER() OVER (ORDER BY ri.position DESC) AS pos_order
    FROM public.ranking_items ri
    JOIN public.rappers r ON r.id = ri.rapper_id
    WHERE ri.ranking_id = p_ranking_id AND ri.is_ranked = FALSE
  )
  UPDATE public.ranking_items ri
  SET position = -u2.position
  FROM unranked u1
  JOIN unranked u2 ON u2.pos_order = u1.name_order
  WHERE ri.id = u1.id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.resort_user_ranking_unranked_alphabetically(p_ranking_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 VOLATILE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.user_ranking_items
  SET position = -position
  WHERE ranking_id = p_ranking_id AND is_ranked = FALSE AND position > 0;

  WITH unranked AS (
    SELECT uri.id, uri.position,
           ROW_NUMBER() OVER (ORDER BY r.name) AS name_order,
           ROW_NUMBER() OVER (ORDER BY uri.position DESC) AS pos_order
    FROM public.user_ranking_items uri
    JOIN public.rappers r ON r.id = uri.rapper_id
    WHERE uri.ranking_id = p_ranking_id AND uri.is_ranked = FALSE
  )
  UPDATE public.user_ranking_items uri
  SET position = -u2.position
  FROM unranked u1
  JOIN unranked u2 ON u2.pos_order = u1.name_order
  WHERE uri.id = u1.id;
END;
$function$;

-- 1. Official rankings trigger: skip drafts, slot alphabetically
CREATE OR REPLACE FUNCTION public.add_rapper_to_all_rankings()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  ranking_record RECORD;
  max_position INTEGER;
BEGIN
  IF NEW.publish_status IS DISTINCT FROM 'published' THEN
    RETURN NEW;
  END IF;

  FOR ranking_record IN SELECT id FROM public.official_rankings LOOP
    SELECT COALESCE(MAX(position), 0) + 1 INTO max_position
    FROM public.ranking_items
    WHERE ranking_id = ranking_record.id;

    INSERT INTO public.ranking_items (ranking_id, rapper_id, position, is_ranked)
    VALUES (ranking_record.id, NEW.id, max_position, FALSE)
    ON CONFLICT (ranking_id, rapper_id) DO NOTHING;

    PERFORM public.resort_ranking_unranked_alphabetically(ranking_record.id);
  END LOOP;

  RETURN NEW;
END;
$function$;

-- 2. User rankings trigger: same behavior
CREATE OR REPLACE FUNCTION public.add_rapper_to_all_user_rankings()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  ranking_record RECORD;
  max_position INTEGER;
BEGIN
  IF NEW.publish_status IS DISTINCT FROM 'published' THEN
    RETURN NEW;
  END IF;

  FOR ranking_record IN SELECT id FROM public.user_rankings LOOP
    SELECT COALESCE(MAX(position), 0) + 1 INTO max_position
    FROM public.user_ranking_items
    WHERE ranking_id = ranking_record.id;

    INSERT INTO public.user_ranking_items (ranking_id, rapper_id, position, is_ranked)
    VALUES (ranking_record.id, NEW.id, max_position, FALSE)
    ON CONFLICT (ranking_id, rapper_id) DO NOTHING;

    PERFORM public.resort_user_ranking_unranked_alphabetically(ranking_record.id);
  END LOOP;

  RETURN NEW;
END;
$function$;

-- 3. Fire on INSERT and on publish_status change (draft -> published)
DROP TRIGGER IF EXISTS add_new_rapper_to_rankings ON public.rappers;
CREATE TRIGGER add_new_rapper_to_rankings
  AFTER INSERT OR UPDATE OF publish_status ON public.rappers
  FOR EACH ROW EXECUTE FUNCTION public.add_rapper_to_all_rankings();

DROP TRIGGER IF EXISTS add_rapper_to_user_rankings_trigger ON public.rappers;
CREATE TRIGGER add_rapper_to_user_rankings_trigger
  AFTER INSERT OR UPDATE OF publish_status ON public.rappers
  FOR EACH ROW EXECUTE FUNCTION public.add_rapper_to_all_user_rankings();

-- 4. Populate functions: only published rappers
CREATE OR REPLACE FUNCTION public.populate_ranking_with_all_rappers(ranking_uuid uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  rapper_record RECORD;
  current_position INTEGER := 1;
  max_existing_position INTEGER := 0;
BEGIN
  SELECT COALESCE(MAX(position), 0) INTO max_existing_position
  FROM public.ranking_items
  WHERE ranking_id = ranking_uuid;

  current_position := max_existing_position + 1;

  FOR rapper_record IN
    SELECT r.id
    FROM public.rappers r
    WHERE r.publish_status = 'published'
      AND NOT EXISTS (
        SELECT 1 FROM public.ranking_items ri
        WHERE ri.ranking_id = ranking_uuid AND ri.rapper_id = r.id
      )
    ORDER BY r.name
  LOOP
    INSERT INTO public.ranking_items (ranking_id, rapper_id, position, is_ranked)
    VALUES (ranking_uuid, rapper_record.id, current_position, FALSE);
    current_position := current_position + 1;
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.populate_user_ranking_with_all_rappers(ranking_uuid uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  rapper_record RECORD;
  current_position INTEGER := 1;
  max_existing_position INTEGER := 0;
BEGIN
  SELECT COALESCE(MAX(position), 0) INTO max_existing_position
  FROM public.user_ranking_items
  WHERE ranking_id = ranking_uuid;

  current_position := max_existing_position + 1;

  FOR rapper_record IN
    SELECT r.id
    FROM public.rappers r
    WHERE r.publish_status = 'published'
      AND NOT EXISTS (
        SELECT 1 FROM public.user_ranking_items uri
        WHERE uri.ranking_id = ranking_uuid AND uri.rapper_id = r.id
      )
    ORDER BY r.name
  LOOP
    INSERT INTO public.user_ranking_items (ranking_id, rapper_id, position, is_ranked)
    VALUES (ranking_uuid, rapper_record.id, current_position, FALSE);
    current_position := current_position + 1;
  END LOOP;
END;
$function$;

-- 5. Remove draft rappers from all existing ranking lists
DELETE FROM public.ranking_items ri
USING public.rappers r
WHERE ri.rapper_id = r.id AND r.publish_status IS DISTINCT FROM 'published';

DELETE FROM public.user_ranking_items uri
USING public.rappers r
WHERE uri.rapper_id = r.id AND r.publish_status IS DISTINCT FROM 'published';

-- 6. Re-sort existing unranked items alphabetically across all rankings
DO $$
DECLARE
  ranking_record RECORD;
BEGIN
  FOR ranking_record IN SELECT id FROM public.official_rankings LOOP
    PERFORM public.resort_ranking_unranked_alphabetically(ranking_record.id);
  END LOOP;
  FOR ranking_record IN SELECT id FROM public.user_rankings LOOP
    PERFORM public.resort_user_ranking_unranked_alphabetically(ranking_record.id);
  END LOOP;
END;
$$;