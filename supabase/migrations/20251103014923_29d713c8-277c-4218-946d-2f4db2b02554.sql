-- Add cypher_visits column to member_stats table
ALTER TABLE public.member_stats 
ADD COLUMN IF NOT EXISTS cypher_visits integer DEFAULT 0;

-- Update increment_page_visit_stat function to handle cypher_visits
CREATE OR REPLACE FUNCTION public.increment_page_visit_stat(stat_field text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  IF stat_field = 'blog_visits' THEN
    INSERT INTO public.member_stats (id, blog_visits, updated_at)
    VALUES (auth.uid(), 1, NOW())
    ON CONFLICT (id) DO UPDATE
      SET blog_visits = public.member_stats.blog_visits + 1,
          updated_at = NOW();

  ELSIF stat_field = 'about_visits' THEN
    INSERT INTO public.member_stats (id, about_visits, updated_at)
    VALUES (auth.uid(), 1, NOW())
    ON CONFLICT (id) DO UPDATE
      SET about_visits = public.member_stats.about_visits + 1,
          updated_at = NOW();

  ELSIF stat_field = 'analytics_visits' THEN
    INSERT INTO public.member_stats (id, analytics_visits, updated_at)
    VALUES (auth.uid(), 1, NOW())
    ON CONFLICT (id) DO UPDATE
      SET analytics_visits = public.member_stats.analytics_visits + 1,
          updated_at = NOW();

  ELSIF stat_field = 'vs_visits' THEN
    INSERT INTO public.member_stats (id, vs_visits, updated_at)
    VALUES (auth.uid(), 1, NOW())
    ON CONFLICT (id) DO UPDATE
      SET vs_visits = public.member_stats.vs_visits + 1,
          updated_at = NOW();

  ELSIF stat_field = 'cypher_visits' THEN
    INSERT INTO public.member_stats (id, cypher_visits, updated_at)
    VALUES (auth.uid(), 1, NOW())
    ON CONFLICT (id) DO UPDATE
      SET cypher_visits = public.member_stats.cypher_visits + 1,
          updated_at = NOW();
  END IF;

  PERFORM public.check_and_award_achievements(auth.uid());
END;
$function$;

-- Update the Community Participant achievement to become Cypher Junkie
UPDATE public.achievements 
SET 
  name = 'Cypher Junkie',
  description = 'Visit the Community Cypher 5 times to prove your dedication',
  threshold_value = 5,
  threshold_field = 'cypher_visits',
  icon = 'Mic2',
  updated_at = NOW()
WHERE id = '3fa12bb2-1d0c-4bce-bc09-3dc1b7533399';