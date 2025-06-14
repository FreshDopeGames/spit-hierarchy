
-- First, let's add birth month and day data to existing rappers
UPDATE rappers SET birth_month = 10, birth_day = 17 WHERE name = 'Eminem'; -- October 17, 1972
UPDATE rappers SET birth_month = 12, birth_day = 4 WHERE name = 'Jay-Z'; -- December 4, 1969
UPDATE rappers SET birth_month = 6, birth_day = 16 WHERE name = 'Tupac'; -- June 16, 1971
UPDATE rappers SET birth_month = 5, birth_day = 21 WHERE name = 'Notorious B.I.G.'; -- May 21, 1972
UPDATE rappers SET birth_month = 10, birth_day = 15 WHERE name = 'Snoop Dogg'; -- October 20, 1971
UPDATE rappers SET birth_month = 2, birth_day = 18 WHERE name = 'Dr. Dre'; -- February 18, 1965
UPDATE rappers SET birth_month = 3, birth_day = 9 WHERE name = 'Nas'; -- September 14, 1973
UPDATE rappers SET birth_month = 8, birth_day = 31 WHERE name = 'Kanye West'; -- June 8, 1977
UPDATE rappers SET birth_month = 12, birth_day = 18 WHERE name = 'Kendrick Lamar'; -- June 17, 1987
UPDATE rappers SET birth_month = 1, birth_day = 28 WHERE name = 'J. Cole'; -- January 28, 1985

-- Create dummy user profiles for network analysis
INSERT INTO auth.users (id, email, created_at, updated_at, email_confirmed_at, raw_user_meta_data) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'demo_user1@example.com', NOW() - INTERVAL '30 days', NOW(), NOW() - INTERVAL '30 days', '{"username": "hiphop_lover", "full_name": "Alex Johnson"}'),
  ('550e8400-e29b-41d4-a716-446655440002', 'demo_user2@example.com', NOW() - INTERVAL '25 days', NOW(), NOW() - INTERVAL '25 days', '{"username": "rap_critic", "full_name": "Jordan Smith"}'),
  ('550e8400-e29b-41d4-a716-446655440003', 'demo_user3@example.com', NOW() - INTERVAL '20 days', NOW(), NOW() - INTERVAL '20 days', '{"username": "beat_head", "full_name": "Casey Williams"}'),
  ('550e8400-e29b-41d4-a716-446655440004', 'demo_user4@example.com', NOW() - INTERVAL '15 days', NOW(), NOW() - INTERVAL '15 days', '{"username": "lyric_master", "full_name": "Riley Davis"}'),
  ('550e8400-e29b-41d4-a716-446655440005', 'demo_user5@example.com', NOW() - INTERVAL '10 days', NOW(), NOW() - INTERVAL '10 days', '{"username": "flow_enthusiast", "full_name": "Sam Martinez"}')
ON CONFLICT (id) DO NOTHING;

-- Insert profiles for these users
INSERT INTO profiles (id, username, full_name, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'hiphop_lover', 'Alex Johnson', NOW() - INTERVAL '30 days'),
  ('550e8400-e29b-41d4-a716-446655440002', 'rap_critic', 'Jordan Smith', NOW() - INTERVAL '25 days'),
  ('550e8400-e29b-41d4-a716-446655440003', 'beat_head', 'Casey Williams', NOW() - INTERVAL '20 days'),
  ('550e8400-e29b-41d4-a716-446655440004', 'lyric_master', 'Riley Davis', NOW() - INTERVAL '15 days'),
  ('550e8400-e29b-41d4-a716-446655440005', 'flow_enthusiast', 'Sam Martinez', NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- Insert member stats for these users
INSERT INTO member_stats (id, total_votes, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 0, NOW() - INTERVAL '30 days'),
  ('550e8400-e29b-41d4-a716-446655440002', 0, NOW() - INTERVAL '25 days'),
  ('550e8400-e29b-41d4-a716-446655440003', 0, NOW() - INTERVAL '20 days'),
  ('550e8400-e29b-41d4-a716-446655440004', 0, NOW() - INTERVAL '15 days'),
  ('550e8400-e29b-41d4-a716-446655440005', 0, NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- Get the first voting category ID for our dummy votes
-- Create dummy voting data for the last 7 days
-- Note: We'll need to get rapper IDs and category IDs from existing data
WITH rapper_ids AS (
  SELECT id, name FROM rappers LIMIT 10
),
category_id AS (
  SELECT id FROM voting_categories LIMIT 1
),
user_ids AS (
  SELECT unnest(ARRAY[
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002', 
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440005'
  ]::uuid[]) AS user_id
)
INSERT INTO votes (user_id, rapper_id, category_id, rating, created_at)
SELECT 
  u.user_id,
  r.id,
  c.id,
  (RANDOM() * 9 + 1)::integer, -- Random rating between 1-10
  NOW() - (RANDOM() * INTERVAL '7 days') -- Random time within last 7 days
FROM user_ids u
CROSS JOIN rapper_ids r
CROSS JOIN category_id c
WHERE RANDOM() < 0.3 -- Only create ~30% of possible combinations to make it realistic
LIMIT 200; -- Limit total votes to keep it manageable

-- Update rapper stats based on the new votes
UPDATE rappers 
SET 
  total_votes = COALESCE((SELECT COUNT(*) FROM votes WHERE rapper_id = rappers.id), 0),
  average_rating = COALESCE((SELECT AVG(rating) FROM votes WHERE rapper_id = rappers.id), 0);

-- Update member stats for the demo users
UPDATE member_stats 
SET 
  total_votes = COALESCE((SELECT COUNT(*) FROM votes WHERE user_id = member_stats.id), 0),
  last_vote_date = COALESCE((SELECT MAX(created_at)::date FROM votes WHERE user_id = member_stats.id), NULL)
WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440005'
);
