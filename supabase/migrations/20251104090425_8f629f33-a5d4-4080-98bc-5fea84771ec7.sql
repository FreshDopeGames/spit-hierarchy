-- Create function to get member with most achievements (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_member_with_most_achievements()
RETURNS TABLE (
  id uuid,
  username text,
  avatar_url text,
  achievement_count integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.id,
    p.username,
    p.avatar_url,
    COUNT(ua.id)::integer AS achievement_count
  FROM public.profiles p
  JOIN public.user_achievements ua ON ua.user_id = p.id
  GROUP BY p.id, p.username, p.avatar_url
  ORDER BY COUNT(ua.id) DESC
  LIMIT 1;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_member_with_most_achievements() TO anon, authenticated;

-- Create index for performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);