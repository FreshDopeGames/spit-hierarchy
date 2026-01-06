-- Create user_referrals table to store UTM and acquisition data
CREATE TABLE public.user_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Standard UTM parameters
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  -- Additional tracking
  referrer_url TEXT,
  landing_page TEXT,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Indexes for analytics queries
CREATE INDEX idx_user_referrals_user_id ON user_referrals(user_id);
CREATE INDEX idx_user_referrals_utm_source ON user_referrals(utm_source);
CREATE INDEX idx_user_referrals_utm_campaign ON user_referrals(utm_campaign);
CREATE INDEX idx_user_referrals_created_at ON user_referrals(created_at);

-- Enable RLS
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;

-- Admin can view all referrals
CREATE POLICY "Admins can view all referrals"
ON public.user_referrals
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- Users can view their own referral data
CREATE POLICY "Users can view own referral"
ON public.user_referrals
FOR SELECT
USING (auth.uid() = user_id);

-- System can insert referral data
CREATE POLICY "System can insert referrals"
ON public.user_referrals
FOR INSERT
WITH CHECK (true);

-- Create function to get acquisition stats by source
CREATE OR REPLACE FUNCTION get_acquisition_by_source(
  start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days')::DATE,
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  source TEXT,
  medium TEXT,
  signup_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(utm_source, 'direct') as source,
    COALESCE(utm_medium, 'none') as medium,
    COUNT(*) as signup_count
  FROM user_referrals
  WHERE created_at::DATE BETWEEN start_date AND end_date
  GROUP BY COALESCE(utm_source, 'direct'), COALESCE(utm_medium, 'none')
  ORDER BY signup_count DESC;
$$;

-- Create function to get campaign performance
CREATE OR REPLACE FUNCTION get_campaign_performance(
  start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days')::DATE,
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  campaign TEXT,
  source TEXT,
  medium TEXT,
  signup_count BIGINT,
  first_signup TIMESTAMPTZ,
  last_signup TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(utm_campaign, 'none') as campaign,
    COALESCE(utm_source, 'direct') as source,
    COALESCE(utm_medium, 'none') as medium,
    COUNT(*) as signup_count,
    MIN(created_at) as first_signup,
    MAX(created_at) as last_signup
  FROM user_referrals
  WHERE created_at::DATE BETWEEN start_date AND end_date
  GROUP BY COALESCE(utm_campaign, 'none'), COALESCE(utm_source, 'direct'), COALESCE(utm_medium, 'none')
  ORDER BY signup_count DESC;
$$;

-- Create function to get daily signups by source
CREATE OR REPLACE FUNCTION get_daily_signups_by_source(
  start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days')::DATE,
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  signup_date DATE,
  source TEXT,
  signup_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    created_at::DATE as signup_date,
    COALESCE(utm_source, 'direct') as source,
    COUNT(*) as signup_count
  FROM user_referrals
  WHERE created_at::DATE BETWEEN start_date AND end_date
  GROUP BY created_at::DATE, COALESCE(utm_source, 'direct')
  ORDER BY signup_date DESC, signup_count DESC;
$$;