DROP POLICY "Anyone can view user quiz badges" ON public.user_quiz_badges;
CREATE POLICY "Users view own quiz badges or admins" ON public.user_quiz_badges FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY "Public read access to top rappers" ON public.user_top_rappers;
CREATE POLICY "Admins view all top rappers" ON public.user_top_rappers FOR SELECT TO authenticated USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.get_public_top_five(p_user_id uuid)
RETURNS TABLE("position" integer, rapper_id uuid, rapper_name text, rapper_slug text, rapper_image_url text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT t.position, t.rapper_id, r.name, r.slug, r.image_url
  FROM public.user_top_rappers t JOIN public.rappers r ON r.id = t.rapper_id
  WHERE t.user_id = p_user_id ORDER BY t.position $$;

CREATE OR REPLACE FUNCTION public.get_public_quiz_badges(p_user_id uuid)
RETURNS TABLE(id uuid, badge_id uuid, earned_at timestamptz, badge jsonb)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT ub.id, ub.badge_id, ub.earned_at, to_jsonb(b.*)
  FROM public.user_quiz_badges ub JOIN public.quiz_badges b ON b.id = ub.badge_id
  WHERE ub.user_id = p_user_id ORDER BY ub.earned_at DESC $$;

CREATE OR REPLACE FUNCTION public.get_top5_counts_for_rappers(p_rapper_ids uuid[])
RETURNS TABLE(rapper_id uuid, top5_count integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT t.rapper_id, count(*)::int FROM public.user_top_rappers t
  WHERE t.rapper_id = ANY(p_rapper_ids) GROUP BY t.rapper_id $$;

GRANT EXECUTE ON FUNCTION public.get_public_top_five(uuid), public.get_public_quiz_badges(uuid), public.get_top5_counts_for_rappers(uuid[]) TO anon, authenticated, service_role;