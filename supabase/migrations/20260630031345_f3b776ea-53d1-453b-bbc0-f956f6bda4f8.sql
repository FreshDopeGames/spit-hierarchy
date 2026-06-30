
ALTER FUNCTION public.calculate_member_status(integer) SET search_path = public;
ALTER FUNCTION public.calculate_rapper_attribute_votes(uuid) SET search_path = public;
ALTER FUNCTION public.calculate_rapper_average_rating(uuid) SET search_path = public;
ALTER FUNCTION public.calculate_rapper_percentile(uuid) SET search_path = public;
ALTER FUNCTION public.ensure_album_slug_trigger_fn() SET search_path = public;
ALTER FUNCTION public.generate_album_slug(text, uuid) SET search_path = public;
ALTER FUNCTION public.get_position_delta(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.get_user_rated_rapper_ids(uuid) SET search_path = public;
ALTER FUNCTION public.get_vote_weight(member_status) SET search_path = public;
ALTER FUNCTION public.matches_alias(text[], text) SET search_path = public;
ALTER FUNCTION public.search_rappers(text, uuid[], integer) SET search_path = public;
ALTER FUNCTION public.trigger_achievement_check() SET search_path = public;
ALTER FUNCTION public.update_blog_post_likes_count() SET search_path = public;
ALTER FUNCTION public.update_member_stats_on_ranking_vote() SET search_path = public;
ALTER FUNCTION public.update_member_stats_on_user_ranking_vote() SET search_path = public;
ALTER FUNCTION public.update_member_stats_on_vote() SET search_path = public;
ALTER FUNCTION public.update_rapper_attribute_stats() SET search_path = public;
ALTER FUNCTION public.update_rapper_stats() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

ALTER VIEW public.track_vote_counts SET (security_invoker = true);
ALTER VIEW public.poll_results SET (security_invoker = true);

REVOKE ALL ON public.user_ranking_vote_counts FROM anon, authenticated;

DROP POLICY IF EXISTS "System can insert referrals" ON public.user_referrals;
CREATE POLICY "Authenticated users can insert their own referrals"
  ON public.user_referrals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can insert consent logs" ON public.consent_logs;
CREATE POLICY "Owner or anon session can insert consent logs"
  ON public.consent_logs FOR INSERT TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
  );

DROP POLICY IF EXISTS "Anyone can track page views" ON public.rapper_page_views;
CREATE POLICY "Session-scoped page view tracking"
  ON public.rapper_page_views FOR INSERT TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
  );

DROP POLICY IF EXISTS "Anyone can track ranking views" ON public.user_ranking_views;
CREATE POLICY "Session-scoped ranking view tracking"
  ON public.user_ranking_views FOR INSERT TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
  );

DROP POLICY IF EXISTS "Allow public access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for blog images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for header images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to album covers" ON storage.objects;
