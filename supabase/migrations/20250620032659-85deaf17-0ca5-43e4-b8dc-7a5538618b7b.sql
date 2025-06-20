
-- Update user_top_rappers table to use rapper_id instead of rapper_name
ALTER TABLE public.user_top_rappers 
DROP COLUMN rapper_name,
ADD COLUMN rapper_id uuid REFERENCES public.rappers(id) ON DELETE CASCADE;

-- Add unique constraint to prevent duplicate rappers per user
ALTER TABLE public.user_top_rappers 
ADD CONSTRAINT unique_user_rapper UNIQUE (user_id, rapper_id);

-- Add unique constraint for position per user to ensure no duplicate positions
ALTER TABLE public.user_top_rappers 
ADD CONSTRAINT unique_user_position UNIQUE (user_id, position);
