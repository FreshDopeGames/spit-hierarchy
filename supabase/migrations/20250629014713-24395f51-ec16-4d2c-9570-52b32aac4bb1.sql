
-- Update existing Big KRIT entry to correct name format
UPDATE public.rappers 
SET name = 'Big K.R.I.T.', updated_at = NOW()
WHERE name = 'Big KRIT';

-- Add 6 established rappers with comprehensive data
INSERT INTO public.rappers (name, real_name, origin, birth_year, birth_month, birth_day, bio, verified, twitter_handle, instagram_handle, spotify_id) VALUES
('B.o.B', 'Bobby Ray Simmons Jr.', 'Winston-Salem, North Carolina', 1988, 11, 15, 'Multi-platinum rapper, singer, and producer known for hits like "Airplanes" featuring Hayley Williams and "Nothin'' on You" with Bruno Mars. Known for his versatility across hip-hop, pop, and rock genres.', true, 'bobatl', 'bobatl', '5K4W6rqBFWDnAN6FQUkS6x'),

('Anderson .Paak', 'Brandon Paak Anderson', 'Oxnard, California', 1986, 2, 8, 'Grammy Award-winning rapper, singer, songwriter, and drummer. Known for his soulful blend of hip-hop, R&B, funk, and soul. Member of duo Silk Sonic with Bruno Mars and leader of band The Free Nationals.', true, 'andersonpaak', 'andersonpaak', '3jK9MiCrA42lLAdMGUZpwa'),

('Chance The Rapper', 'Chancelor Johnathan Bennett', 'Chicago, Illinois', 1993, 4, 16, 'Grammy Award-winning independent rapper known for his gospel-influenced hip-hop and philanthropic efforts. Gained fame through free mixtapes and became the first streaming-only artist to win a Grammy.', true, 'chancetherapper', 'chancetherapper', '1anyVhU62p31KFi8MEzkbf'),

('CyHi The Prynce', 'Cydel Charles Young', 'Stone Mountain, Georgia', 1984, 9, 15, 'Rapper and songwriter signed to Kanye West''s G.O.O.D. Music label. Known for his storytelling ability and contributions as a ghostwriter for major artists including Kanye West, Jay-Z, and Travis Scott.', true, 'cyhitheprynce', 'cyhitheprynce', '0Y7qkJCKo3wUFUEErrLG8V'),

('Dave East', 'David Lawrence Brewster Jr.', 'New York, New York', 1988, 6, 3, 'East Coast rapper known for his lyrical prowess and authentic street narratives. Signed to Nas'' Mass Appeal Records and Def Jam. Known for mixtapes like "Black Rose" and collaborations with major artists.', true, 'daveeast', 'daveeast', '1VPOWOaO9M8KN9xeCRaDHI'),

('G Herbo', 'Herbert Randall Wright III', 'Chicago, Illinois', 1995, 10, 8, 'Chicago drill rapper known for his raw storytelling and vivid depictions of street life. Originally performed as Lil Herb before changing to G Herbo. Known for albums like "Humble Beast" and "PTSD."', true, 'gherbo_ebn', 'gherbo', '3F4jhqkFbkdaqgJSKoSDNl')

ON CONFLICT (name) DO NOTHING;
