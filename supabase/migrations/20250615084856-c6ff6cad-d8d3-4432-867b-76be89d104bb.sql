
DELETE FROM public.user_rankings
WHERE id <> (
  SELECT id FROM public.user_rankings ORDER BY created_at DESC LIMIT 1
);
