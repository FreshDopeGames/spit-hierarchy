-- Remove the existing unique constraint that prevents multiple votes per user per poll
ALTER TABLE public.poll_votes DROP CONSTRAINT IF EXISTS poll_votes_poll_id_user_id_key;

-- Add a new unique constraint on (poll_id, user_id, option_id) to prevent duplicate option votes
-- while allowing multiple options per poll for multi-choice polls
ALTER TABLE public.poll_votes ADD CONSTRAINT poll_votes_poll_user_option_unique 
UNIQUE (poll_id, user_id, option_id);