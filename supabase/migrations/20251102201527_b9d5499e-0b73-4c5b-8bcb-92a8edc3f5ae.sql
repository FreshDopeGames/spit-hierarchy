-- Add page visit tracking columns to member_stats
ALTER TABLE public.member_stats 
ADD COLUMN IF NOT EXISTS blog_visits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS about_visits INTEGER DEFAULT 0;

-- Create function to increment page visit stats
CREATE OR REPLACE FUNCTION public.increment_page_visit_stat(
  stat_field TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only increment for authenticated users
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  -- Dynamically increment the specified stat field
  IF stat_field = 'blog_visits' THEN
    INSERT INTO public.member_stats (id, blog_visits, updated_at)
    VALUES (auth.uid(), 1, NOW())
    ON CONFLICT (id) 
    DO UPDATE SET 
      blog_visits = public.member_stats.blog_visits + 1,
      updated_at = NOW();
  ELSIF stat_field = 'about_visits' THEN
    INSERT INTO public.member_stats (id, about_visits, updated_at)
    VALUES (auth.uid(), 1, NOW())
    ON CONFLICT (id) 
    DO UPDATE SET 
      about_visits = public.member_stats.about_visits + 1,
      updated_at = NOW();
  END IF;

  -- Trigger achievement check after stat update
  PERFORM public.check_and_award_achievements(auth.uid());
END;
$$;