
-- Set up the daily cron job for ranking maintenance
SELECT cron.schedule(
  'daily-ranking-maintenance',
  '0 1 * * *', -- Daily at 1:00 AM
  $$
  SELECT public.daily_ranking_maintenance();
  $$
);
