-- Create consent_logs table for GDPR/CCPA audit trail
CREATE TABLE IF NOT EXISTS public.consent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  consent_state jsonb NOT NULL,
  action text NOT NULL CHECK (action IN ('accept_all', 'reject_all', 'custom', 'update', 'reset')),
  region text NOT NULL CHECK (region IN ('EU', 'CA', 'OTHER')),
  ip_address text,
  user_agent text,
  timestamp timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own consent logs
CREATE POLICY "Users can view their own consent logs"
  ON public.consent_logs
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Anyone can insert consent logs (for anonymous tracking)
CREATE POLICY "Anyone can insert consent logs"
  ON public.consent_logs
  FOR INSERT
  WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_consent_logs_user_id ON public.consent_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_logs_session_id ON public.consent_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_consent_logs_timestamp ON public.consent_logs(timestamp DESC);