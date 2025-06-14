
-- Add activity tracking columns to official_rankings table
ALTER TABLE public.official_rankings 
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS activity_score INTEGER DEFAULT 0;

-- Create an index for better performance when querying by activity
CREATE INDEX IF NOT EXISTS idx_official_rankings_activity 
ON public.official_rankings (activity_score DESC, last_activity_at DESC);

-- Update activity scores based on recent votes (this gives us initial data)
UPDATE public.official_rankings 
SET 
  activity_score = COALESCE((
    SELECT COUNT(*)::INTEGER 
    FROM votes v 
    JOIN ranking_items ri ON v.rapper_id = ri.rapper_id 
    WHERE ri.ranking_id = official_rankings.id 
    AND v.created_at > now() - interval '7 days'
  ), 0),
  last_activity_at = COALESCE((
    SELECT MAX(v.created_at) 
    FROM votes v 
    JOIN ranking_items ri ON v.rapper_id = ri.rapper_id 
    WHERE ri.ranking_id = official_rankings.id
  ), now());

-- Create a function to update activity when votes are cast
CREATE OR REPLACE FUNCTION update_ranking_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update activity for official rankings when votes are cast
  UPDATE public.official_rankings 
  SET 
    last_activity_at = NEW.created_at,
    activity_score = activity_score + 1
  WHERE id IN (
    SELECT ri.ranking_id 
    FROM ranking_items ri 
    WHERE ri.rapper_id = NEW.rapper_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update activity on new votes
DROP TRIGGER IF EXISTS trigger_update_ranking_activity ON votes;
CREATE TRIGGER trigger_update_ranking_activity
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_ranking_activity();
