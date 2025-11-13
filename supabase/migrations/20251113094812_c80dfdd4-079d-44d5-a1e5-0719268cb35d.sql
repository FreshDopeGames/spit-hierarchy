-- Fix Best 80s Rappers ranking by cleaning non-80s artists
-- Current UUID: 3c223edc-e3de-4bb2-94ea-428916feab12

-- Clean the ranking to remove non-80s rappers
SELECT clean_official_ranking_items(
  '3c223edc-e3de-4bb2-94ea-428916feab12'::UUID,
  '{"decades":["1980s"],"locations":[],"tag_ids":[],"artist_types":[]}'::jsonb
);

-- Recalculate positions to ensure sequential ordering
SELECT recalculate_ranking_positions('3c223edc-e3de-4bb2-94ea-428916feab12'::UUID);