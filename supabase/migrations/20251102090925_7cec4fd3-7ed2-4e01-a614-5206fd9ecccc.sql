-- Reorder Exploration achievements by rarity: Common → Rare → Epic
-- Common achievements (tiers 1-3)
UPDATE achievements 
SET tier_level = 1
WHERE name = 'Blog Reader' AND series_name = 'Exploration';

UPDATE achievements 
SET tier_level = 2
WHERE name = 'About Explorer' AND series_name = 'Exploration';

UPDATE achievements 
SET tier_level = 3
WHERE name = 'Self Reflector' AND series_name = 'Exploration';

-- Rare achievements (tiers 4-6)
UPDATE achievements 
SET tier_level = 4
WHERE name = 'VS Spectator' AND series_name = 'Exploration';

UPDATE achievements 
SET tier_level = 5
WHERE name = 'Community Participant' AND series_name = 'Exploration';

UPDATE achievements 
SET tier_level = 6
WHERE name = 'Profile Viewer' AND series_name = 'Exploration';

-- Epic achievement (tier 7)
UPDATE achievements 
SET tier_level = 7
WHERE name = 'Data Analyst' AND series_name = 'Exploration';