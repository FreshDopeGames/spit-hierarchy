-- Update discography_last_updated for rappers with albums but stale/null timestamp
-- This ensures the 7-day cache check works correctly going forward
UPDATE rappers r
SET discography_last_updated = NOW()
WHERE EXISTS (SELECT 1 FROM rapper_albums ra WHERE ra.rapper_id = r.id)
  AND (r.discography_last_updated IS NULL 
       OR r.discography_last_updated < NOW() - INTERVAL '7 days');