-- Add filter_criteria column to official_rankings table
ALTER TABLE official_rankings 
ADD COLUMN IF NOT EXISTS filter_criteria JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN official_rankings.filter_criteria IS 'Stores filter criteria for ranking population';