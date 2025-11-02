-- Deactivate obsolete achievement series that are no longer relevant
UPDATE achievements 
SET is_active = false 
WHERE series_name IN ('Community Builder', 'Detailed Critic');

-- Add new Exploration achievement series for page visits
INSERT INTO achievements (
  name, 
  description, 
  icon, 
  type, 
  rarity, 
  points, 
  threshold_value, 
  threshold_field,
  series_name,
  tier_level,
  is_active
) VALUES
-- Exploration Series
(
  'Blog Reader',
  'Visit the blog page to discover community content',
  'BookOpen',
  'engagement',
  'common',
  10,
  1,
  'blog_visits',
  'Exploration',
  1,
  true
),
(
  'About Explorer',
  'Learn about the platform by visiting the About page',
  'Info',
  'engagement',
  'common',
  15,
  1,
  'about_visits',
  'Exploration',
  2,
  true
),
(
  'VS Spectator',
  'Check out rapper comparisons on the VS page',
  'Zap',
  'engagement',
  'rare',
  20,
  1,
  'vs_visits',
  'Exploration',
  3,
  true
),
(
  'Community Participant',
  'Join the conversation by visiting Community Cypher',
  'MessageCircle',
  'engagement',
  'rare',
  25,
  1,
  'cypher_visits',
  'Exploration',
  4,
  true
),
(
  'Data Analyst',
  'Dive into the numbers by visiting the Analytics page',
  'BarChart3',
  'engagement',
  'epic',
  30,
  1,
  'analytics_visits',
  'Exploration',
  5,
  true
),
(
  'Profile Viewer',
  'Explore the community by viewing another user''s profile',
  'Users',
  'engagement',
  'epic',
  35,
  1,
  'profile_views',
  'Exploration',
  6,
  true
),
(
  'Self Reflector',
  'Check your own stats by visiting your profile page',
  'User',
  'engagement',
  'legendary',
  50,
  1,
  'own_profile_visits',
  'Exploration',
  7,
  true
);