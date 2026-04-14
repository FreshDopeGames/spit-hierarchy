ALTER TABLE public.member_stats
  ADD COLUMN IF NOT EXISTS daily_sessions_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_session_date date DEFAULT NULL;