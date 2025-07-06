
-- Drop the existing check constraint that's blocking cypher comments
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_content_type_check;

-- Add the updated constraint that includes 'cypher' as a valid content_type
ALTER TABLE public.comments ADD CONSTRAINT comments_content_type_check 
CHECK ((content_type = ANY (ARRAY['blog'::text, 'rapper'::text, 'ranking'::text, 'cypher'::text])));
