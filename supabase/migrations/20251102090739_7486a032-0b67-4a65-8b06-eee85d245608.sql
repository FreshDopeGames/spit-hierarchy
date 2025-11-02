-- Update rarity levels for Exploration achievements
UPDATE achievements 
SET 
  rarity = 'common',
  points = 15
WHERE name = 'Self Reflector' AND series_name = 'Exploration';

UPDATE achievements 
SET 
  rarity = 'rare',
  points = 25
WHERE name = 'Profile Viewer' AND series_name = 'Exploration';