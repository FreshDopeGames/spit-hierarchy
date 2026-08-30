ALTER TABLE public.rappers
  ADD COLUMN IF NOT EXISTS requires_context_match boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.rappers.requires_context_match IS
  'When true, news/social mentions of this name only count if surrounding text shows hip-hop context and casing matches.';

UPDATE public.rappers
SET requires_context_match = true
WHERE name IN (
  'Common','Evidence','Future','Eve','Freeway','Logic','Buddy','Juvenile',
  'Papoose','Onyx','Scarface','Conway','Shad','Noname','Blu','Mase','Saigon',
  'Clipse','Trina','Drake','Nas','The Game','Black Star','Public Enemy',
  'Do Or Die','Big L','Black Thought','Master P','Will Smith'
);