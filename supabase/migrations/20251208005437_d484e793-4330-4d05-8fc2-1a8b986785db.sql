-- Fix albums with NULL track_count where tracks already exist
UPDATE albums a
SET track_count = (
  SELECT COUNT(*)::integer 
  FROM album_tracks at 
  WHERE at.album_id = a.id
)
WHERE a.track_count IS NULL
  AND EXISTS (SELECT 1 FROM album_tracks at WHERE at.album_id = a.id);