-- Create discography fetch progress table for real-time progress tracking
CREATE TABLE public.discography_fetch_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rapper_id uuid REFERENCES rappers(id) ON DELETE CASCADE,
  fetch_id uuid NOT NULL,
  total_releases int DEFAULT 0,
  processed_releases int DEFAULT 0,
  current_album text,
  status text DEFAULT 'starting', -- 'starting', 'fetching', 'processing', 'complete', 'error'
  started_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(rapper_id, fetch_id)
);

-- Enable RLS
ALTER TABLE public.discography_fetch_progress ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read progress (for realtime subscriptions)
CREATE POLICY "Anyone can view fetch progress"
ON public.discography_fetch_progress
FOR SELECT
USING (true);

-- Service role can manage all records (edge function uses service key)
-- No INSERT/UPDATE/DELETE policies needed for regular users

-- Enable Realtime for this table
ALTER publication supabase_realtime ADD TABLE discography_fetch_progress;

-- Add index for faster lookups
CREATE INDEX idx_discography_fetch_progress_fetch_id ON discography_fetch_progress(fetch_id);
CREATE INDEX idx_discography_fetch_progress_rapper_id ON discography_fetch_progress(rapper_id);

-- Cleanup function for old progress records (older than 1 hour)
CREATE OR REPLACE FUNCTION cleanup_old_fetch_progress()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM discography_fetch_progress
  WHERE started_at < now() - interval '1 hour';
END;
$$;