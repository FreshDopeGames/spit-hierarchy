-- Enable realtime for ranking votes
ALTER TABLE ranking_votes REPLICA IDENTITY FULL;

-- Enable realtime for skill votes  
ALTER TABLE votes REPLICA IDENTITY FULL;

-- Add tables to publication only if not already added
DO $$
BEGIN
  -- Check and add ranking_votes
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'ranking_votes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE ranking_votes;
  END IF;

  -- Check and add votes
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'votes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE votes;
  END IF;
END $$;