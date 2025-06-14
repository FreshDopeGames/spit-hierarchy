
-- Correct birth dates for rappers that have incorrect data
UPDATE public.rappers 
SET birth_month = 10, birth_day = 20 
WHERE name = 'Snoop Dogg';

UPDATE public.rappers 
SET birth_month = 9, birth_day = 14 
WHERE name = 'Nas';

UPDATE public.rappers 
SET birth_month = 6, birth_day = 8 
WHERE name = 'Kanye West';

UPDATE public.rappers 
SET birth_month = 6, birth_day = 17 
WHERE name = 'Kendrick Lamar';
