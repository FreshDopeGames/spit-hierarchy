
-- Update the section header title for the rankings section
UPDATE public.section_headers 
SET 
  title = 'GOAT Rapper Rankings',
  updated_at = NOW()
WHERE section_name = 'rankings';
