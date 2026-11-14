-- 1. create_notification: caller may only notify themselves unless admin or server context
CREATE OR REPLACE FUNCTION public.create_notification(p_user_id uuid, p_type text, p_title text, p_message text, p_metadata jsonb DEFAULT '{}'::jsonb, p_link_url text DEFAULT NULL::text, p_priority integer DEFAULT 0)
 RETURNS uuid
 LANGUAGE plpgsql
 VOLATILE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  notification_id UUID;
  user_preferences RECORD;
  caller_role text := auth.role();
BEGIN
  IF NOT (
    caller_role IS NULL
    OR caller_role = 'service_role'
    OR (auth.uid() IS NOT NULL AND auth.uid() = p_user_id)
    OR public.is_admin()
  ) THEN
    RAISE EXCEPTION 'Not authorized to create this notification' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO user_preferences
  FROM notification_preferences
  WHERE user_id = p_user_id;

  IF user_preferences IS NULL OR (
    (p_type = 'achievement' AND user_preferences.achievements_enabled) OR
    (p_type = 'level_up' AND user_preferences.level_ups_enabled) OR
    (p_type IN ('ranking_vote', 'skill_vote') AND user_preferences.voting_activity_enabled) OR
    (p_type = 'comment_reply' AND user_preferences.comment_replies_enabled) OR
    (p_type IN ('system_message', 'admin_broadcast') AND user_preferences.system_messages_enabled)
  ) THEN
    INSERT INTO notifications (user_id, type, title, message, metadata, link_url, priority)
    VALUES (p_user_id, p_type, p_title, p_message, p_metadata, p_link_url, p_priority)
    RETURNING id INTO notification_id;

    RETURN notification_id;
  END IF;

  RETURN NULL;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.create_notification(uuid, text, text, text, jsonb, text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_notification(uuid, text, text, text, jsonb, text, integer) TO authenticated, service_role;

-- 2. broadcast_system_announcement: admin only
CREATE OR REPLACE FUNCTION public.broadcast_system_announcement(announcement_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 VOLATILE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  announcement RECORD;
  target_users UUID[];
  user_id UUID;
  notification_count INTEGER := 0;
  caller_role text := auth.role();
BEGIN
  IF NOT (caller_role IS NULL OR caller_role = 'service_role' OR public.is_admin()) THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO announcement
  FROM system_announcements
  WHERE id = announcement_id AND is_active = true;

  IF announcement IS NULL THEN
    RETURN 0;
  END IF;

  IF announcement.target_audience = 'all' THEN
    SELECT ARRAY_AGG(id) INTO target_users FROM profiles;
  ELSE
    SELECT ARRAY_AGG(ms.id) INTO target_users
    FROM member_stats ms
    WHERE ms.status::TEXT = announcement.target_audience;
  END IF;

  IF target_users IS NULL THEN
    RETURN 0;
  END IF;

  FOREACH user_id IN ARRAY target_users LOOP
    PERFORM create_notification(
      user_id,
      'admin_broadcast',
      announcement.title,
      announcement.message,
      jsonb_build_object(
        'announcement_id', announcement.id,
        'type', announcement.type,
        'icon', announcement.icon
      ),
      announcement.action_url,
      announcement.display_priority
    );
    notification_count := notification_count + 1;
  END LOOP;

  RETURN notification_count;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.broadcast_system_announcement(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.broadcast_system_announcement(uuid) TO authenticated, service_role;

-- 3. clean_official_ranking_items: admin only
CREATE OR REPLACE FUNCTION public.clean_official_ranking_items(ranking_uuid uuid, filter_criteria jsonb)
 RETURNS integer
 LANGUAGE plpgsql
 VOLATILE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count INTEGER;
  decades_array TEXT[];
  locations_array TEXT[];
  tag_ids_array UUID[];
  artist_types_array TEXT[];
  group_tag_id UUID := '423c7cec-44c3-4e9f-a87e-980206cbf989'::UUID;
  caller_role text := auth.role();
BEGIN
  IF NOT (caller_role IS NULL OR caller_role = 'service_role' OR public.is_admin()) THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;

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

  WITH to_delete AS (
    DELETE FROM ranking_items ri
    WHERE ri.ranking_id = ranking_uuid
    AND NOT EXISTS (
      SELECT 1 FROM rappers r
      WHERE r.id = ri.rapper_id
      AND (
        (array_length(decades_array, 1) IS NULL
         AND array_length(locations_array, 1) IS NULL
         AND array_length(tag_ids_array, 1) IS NULL
         AND array_length(artist_types_array, 1) IS NULL)
        OR
        (
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
          (array_length(locations_array, 1) IS NULL OR r.origin = ANY(locations_array))
          AND
          (array_length(tag_ids_array, 1) IS NULL OR
           EXISTS (SELECT 1 FROM rapper_tag_assignments rta WHERE rta.rapper_id = r.id AND rta.tag_id = ANY(tag_ids_array)))
          AND
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
$function$;

REVOKE EXECUTE ON FUNCTION public.clean_official_ranking_items(uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.clean_official_ranking_items(uuid, jsonb) TO authenticated, service_role;

-- 4. get_acquisition_by_source: admin only
CREATE OR REPLACE FUNCTION public.get_acquisition_by_source(start_date date DEFAULT ((CURRENT_DATE - '30 days'::interval))::date, end_date date DEFAULT CURRENT_DATE)
 RETURNS TABLE(source text, medium text, signup_count bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT (auth.role() = 'service_role' OR public.is_admin()) THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    COALESCE(ur.utm_source, 'direct')::text AS source,
    COALESCE(ur.utm_medium, 'none')::text AS medium,
    COUNT(*)::bigint AS signup_count
  FROM user_referrals ur
  WHERE ur.created_at::DATE BETWEEN start_date AND end_date
  GROUP BY COALESCE(ur.utm_source, 'direct'), COALESCE(ur.utm_medium, 'none')
  ORDER BY 3 DESC;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.get_acquisition_by_source(date, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_acquisition_by_source(date, date) TO authenticated, service_role;

-- 5. check_rate_limit: only for the caller's own account
CREATE OR REPLACE FUNCTION public.check_rate_limit(action_type text, user_uuid uuid DEFAULT auth.uid(), max_requests integer DEFAULT 10, window_seconds integer DEFAULT 3600)
 RETURNS boolean
 LANGUAGE plpgsql
 VOLATILE
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  request_count INTEGER;
  window_start TIMESTAMP;
BEGIN
  IF user_uuid IS NULL THEN
    RETURN FALSE;
  END IF;

  IF auth.role() IS DISTINCT FROM 'service_role' AND user_uuid IS DISTINCT FROM auth.uid() THEN
    RETURN FALSE;
  END IF;

  window_start := NOW() - (window_seconds || ' seconds')::INTERVAL;

  SELECT COUNT(*) INTO request_count
  FROM public.votes v
  WHERE v.user_id = user_uuid
    AND v.created_at > window_start
    AND action_type = 'vote';

  RETURN request_count < max_requests;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, uuid, integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, uuid, integer, integer) TO authenticated, service_role;

-- 6. check_musicbrainz_rate_limit: server only
REVOKE EXECUTE ON FUNCTION public.check_musicbrainz_rate_limit(uuid, text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_musicbrainz_rate_limit(uuid, text, integer, integer) TO service_role;

-- 7. IndexNow trigger hook sends the server cron secret
CREATE OR REPLACE FUNCTION public.notify_indexnow(_url text)
 RETURNS void
 LANGUAGE plpgsql
 VOLATILE
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  _secret text;
BEGIN
  SELECT decrypted_secret INTO _secret
  FROM vault.decrypted_secrets
  WHERE name = 'trending_cron_secret'
  LIMIT 1;

  PERFORM net.http_post(
    url := 'https://xzcmkssadekswmiqfbff.supabase.co/functions/v1/indexnow-submit',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', COALESCE(_secret, '')),
    body := jsonb_build_object('url', _url)
  );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'IndexNow notify failed for %: %', _url, SQLERRM;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.notify_indexnow(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.notify_indexnow(text) TO service_role;

-- 8. ListenBrainz daily job sends the server cron secret
SELECT cron.unschedule('fetch-listenbrainz-stats-daily');
SELECT cron.schedule(
  'fetch-listenbrainz-stats-daily',
  '17 4 * * *',
  $cron$
  SELECT net.http_post(
    url := 'https://xzcmkssadekswmiqfbff.supabase.co/functions/v1/fetch-listenbrainz-stats',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'trending_cron_secret' LIMIT 1)
    ),
    body := '{"source":"cron"}'::jsonb
  ) AS request_id;
  $cron$
);