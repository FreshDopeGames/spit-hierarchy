-- Allow VS matches to be created as drafts without rappers assigned yet
ALTER TABLE public.vs_matches ALTER COLUMN rapper_1_id DROP NOT NULL;
ALTER TABLE public.vs_matches ALTER COLUMN rapper_2_id DROP NOT NULL;

-- Update the different_rappers constraint to handle null values
ALTER TABLE public.vs_matches DROP CONSTRAINT IF EXISTS different_rappers;
ALTER TABLE public.vs_matches ADD CONSTRAINT different_rappers
  CHECK (rapper_1_id IS NULL OR rapper_2_id IS NULL OR rapper_1_id <> rapper_2_id);

-- Ensure published matches always have both rappers assigned
ALTER TABLE public.vs_matches ADD CONSTRAINT published_requires_rappers
  CHECK (status <> 'published' OR (rapper_1_id IS NOT NULL AND rapper_2_id IS NOT NULL));