
-- Update the section header title for the rankings section
UPDATE public.section_headers 
SET 
  title = 'The Original Rap GOAT Hierarchy',
  updated_at = NOW()
WHERE section_name = 'rankings';
