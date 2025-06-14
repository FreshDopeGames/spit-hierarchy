
-- Remove non-rappers from the database
DELETE FROM public.rappers WHERE name = 'Robert Downey Jr.';
DELETE FROM public.rappers WHERE name = 'Beyoncé';
DELETE FROM public.rappers WHERE name = 'Ed Sheeran';

-- Remove any other questionable entries that might not be primarily rappers
DELETE FROM public.rappers WHERE name = 'Kyle' AND bio NOT LIKE '%rapper%' AND bio NOT LIKE '%hip-hop%';

-- Now add birth dates ONLY for legitimate rappers
UPDATE public.rappers SET birth_month = 10, birth_day = 24 WHERE name = 'Drake';
UPDATE public.rappers SET birth_month = 10, birth_day = 11 WHERE name = 'Cardi B';
UPDATE public.rappers SET birth_month = 9, birth_day = 27 WHERE name = 'Lil Wayne';
UPDATE public.rappers SET birth_month = 3, birth_day = 25 WHERE name = 'Big Sean';
UPDATE public.rappers SET birth_month = 2, birth_day = 1 WHERE name = 'Big Boi';
UPDATE public.rappers SET birth_month = 1, birth_day = 15 WHERE name = 'Pitbull';
UPDATE public.rappers SET birth_month = 10, birth_day = 31 WHERE name = 'J.I.D';
UPDATE public.rappers SET birth_month = 4, birth_day = 16 WHERE name = 'Chance the Rapper';
UPDATE public.rappers SET birth_month = 12, birth_day = 8 WHERE name = 'Logic';
UPDATE public.rappers SET birth_month = 9, birth_day = 8 WHERE name = 'Wiz Khalifa';
UPDATE public.rappers SET birth_month = 8, birth_day = 27 WHERE name = 'Lil Yachty';
UPDATE public.rappers SET birth_month = 7, birth_day = 31 WHERE name = 'Lil Uzi Vert';
UPDATE public.rappers SET birth_month = 4, birth_day = 30 WHERE name = 'Travis Scott';
UPDATE public.rappers SET birth_month = 3, birth_day = 6 WHERE name = 'Tyler, The Creator';
UPDATE public.rappers SET birth_month = 1, birth_day = 19 WHERE name = 'Mac Miller';
UPDATE public.rappers SET birth_month = 8, birth_day = 16 WHERE name = 'Young Thug';
UPDATE public.rappers SET birth_month = 7, birth_day = 13 WHERE name = 'MF DOOM';
UPDATE public.rappers SET birth_month = 5, birth_day = 6 WHERE name = 'Meek Mill';
UPDATE public.rappers SET birth_month = 7, birth_day = 6 WHERE name = '50 Cent';
UPDATE public.rappers SET birth_month = 11, birth_day = 20 WHERE name = 'Future';
UPDATE public.rappers SET birth_month = 9, birth_day = 11 WHERE name = 'Ludacris';
UPDATE public.rappers SET birth_month = 2, birth_day = 15 WHERE name = 'Megan Thee Stallion';
UPDATE public.rappers SET birth_month = 9, birth_day = 25 WHERE name = 'T.I.';
UPDATE public.rappers SET birth_month = 1, birth_day = 17 WHERE name = 'Lil Jon';
UPDATE public.rappers SET birth_month = 6, birth_day = 18 WHERE name = 'Trippie Redd';
UPDATE public.rappers SET birth_month = 9, birth_day = 13 WHERE name = 'Playboi Carti';
UPDATE public.rappers SET birth_month = 10, birth_day = 9 WHERE name = 'A$AP Rocky';
UPDATE public.rappers SET birth_month = 12, birth_day = 18 WHERE name = 'DMX';
UPDATE public.rappers SET birth_month = 5, birth_day = 21 WHERE name = 'The Notorious B.I.G.';
UPDATE public.rappers SET birth_month = 8, birth_day = 31 WHERE name = 'Jadakiss';
UPDATE public.rappers SET birth_month = 5, birth_day = 24 WHERE name = 'G-Eazy';
UPDATE public.rappers SET birth_month = 12, birth_day = 15 WHERE name = 'Ski Mask The Slump God';
UPDATE public.rappers SET birth_month = 1, birth_day = 8 WHERE name = 'R. Kelly' AND name NOT LIKE '%R. Kelly%'; -- Remove if exists
DELETE FROM public.rappers WHERE name = 'R. Kelly'; -- Remove entirely due to controversies
