-- Expand category constraint to include new question types from CSV
ALTER TABLE quiz_questions 
DROP CONSTRAINT IF EXISTS quiz_questions_category_check;

ALTER TABLE quiz_questions 
ADD CONSTRAINT quiz_questions_category_check 
CHECK (category IN ('rapper_facts', 'albums', 'origins', 'career', 'discography', 'birth_year', 'real_name'));

-- Add rapper_name column for display purposes (useful when rapper_id might be null)
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS rapper_name text;

-- Update existing badges to cover new categories
INSERT INTO quiz_badges (name, description, category, threshold_correct, rarity, points, icon, tier_level)
VALUES 
  ('Birth Year Beginner', 'Answer 10 birth year questions correctly', 'birth_year', 10, 'common', 50, 'Calendar', 1),
  ('Birth Year Scholar', 'Answer 50 birth year questions correctly', 'birth_year', 50, 'rare', 150, 'Calendar', 2),
  ('Birth Year Expert', 'Answer 150 birth year questions correctly', 'birth_year', 150, 'epic', 400, 'Calendar', 3),
  ('Real Name Rookie', 'Answer 10 real name questions correctly', 'real_name', 10, 'common', 50, 'User', 1),
  ('Real Name Scholar', 'Answer 50 real name questions correctly', 'real_name', 50, 'rare', 150, 'User', 2),
  ('Real Name Expert', 'Answer 150 real name questions correctly', 'real_name', 150, 'epic', 400, 'User', 3)
ON CONFLICT DO NOTHING;