-- Drop the existing constraint that doesn't include 'vs_match'
ALTER TABLE comments DROP CONSTRAINT comments_content_type_check;

-- Recreate the constraint with 'vs_match' included
ALTER TABLE comments 
ADD CONSTRAINT comments_content_type_check 
CHECK (content_type = ANY (ARRAY['blog'::text, 'rapper'::text, 'ranking'::text, 'cypher'::text, 'vs_match'::text]));