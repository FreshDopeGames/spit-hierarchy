-- Enable RLS on consent_logs (if not already enabled)
ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;

-- Drop any existing permissive policies
DROP POLICY IF EXISTS "Allow public read access to consent_logs" ON public.consent_logs;
DROP POLICY IF EXISTS "Allow public insert to consent_logs" ON public.consent_logs;
DROP POLICY IF EXISTS "Anyone can insert consent logs" ON public.consent_logs;
DROP POLICY IF EXISTS "Users can read own consent logs" ON public.consent_logs;

-- Allow anyone to INSERT consent logs (consent happens before/without login)
CREATE POLICY "Anyone can insert consent logs"
ON public.consent_logs
FOR INSERT
WITH CHECK (true);

-- Authenticated users can only read their OWN consent logs
CREATE POLICY "Users can read own consent logs"
ON public.consent_logs
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);