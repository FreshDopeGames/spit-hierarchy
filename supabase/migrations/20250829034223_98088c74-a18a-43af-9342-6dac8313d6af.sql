-- Rename section_name column to section to match the component code
ALTER TABLE public.section_headers 
RENAME COLUMN section_name TO section;

-- Update the unique constraint if it exists
ALTER TABLE public.section_headers 
DROP CONSTRAINT IF EXISTS section_headers_section_name_key;

-- Add unique constraint on the renamed column
ALTER TABLE public.section_headers 
ADD CONSTRAINT section_headers_section_key UNIQUE (section);