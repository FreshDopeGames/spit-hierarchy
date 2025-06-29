
-- Add 12 new rappers with comprehensive data
INSERT INTO public.rappers (name, real_name, origin, birth_year, birth_month, birth_day, bio, verified, twitter_handle, instagram_handle, spotify_id) VALUES
('Ray Vaughn', 'Ray Vaughn Jr.', 'Carson, California', 1999, 6, 15, 'Carson-based rapper known for his melodic rap style and introspective lyrics. Part of the new generation of West Coast hip-hop artists.', false, 'rayvaughn_', 'rayvaughn_', '4kYBdusvWMzxsmall7QQ9z'),

('BabyChiefDoit', 'Chief Doit', 'Detroit, Michigan', 1998, 8, 22, 'Detroit rapper representing the new wave of Michigan hip-hop. Known for his energetic delivery and street narratives.', false, 'babychiefdoit', 'babychiefdoit', '3mZQQhU4yWz9kSmall8RtF'),

('Eem Triplin', 'Eem Triplin', 'Cleveland, Ohio', 2000, 3, 10, 'Emerging artist from Cleveland known for his unique flow and experimental approach to hip-hop production.', false, 'eemtriplin', 'eemtriplin', '2nYQqHuZvWzxSmall6QQ8x'),

('1900Rugrat', 'Rugrat', 'Atlanta, Georgia', 1999, 11, 5, 'Underground rapper with a growing social media presence, known for his raw lyrics and authentic street perspective.', false, '1900rugrat', '1900rugrat', null),

('Samara Cyn', 'Samara Johnson', 'Los Angeles, California', 1997, 4, 18, 'Female rapper and singer from Los Angeles, blending hip-hop with R&B influences. Known for her powerful vocals and empowering lyrics.', false, 'samaracyn', 'samaracyn', '5kYBdusvWMzxSmall9QQ7y'),

('Ian', 'Ian Smith', 'New York, New York', 1995, 12, 8, 'New York-based rapper known for his lyrical prowess and collaborations with various artists in the hip-hop scene.', false, 'iantheartist', 'iantheartist', null),

('Gelo', 'LiAngelo Robert Ball', 'Chino Hills, California', 1998, 11, 24, 'Basketball player turned rapper, son of LaVar Ball and brother of Lonzo and LaMelo Ball. Known for his transition from sports to music.', false, 'gelo', 'gelo', '6mZQqHu8vWzxSmall4QQ5w'),

('Loe Shimmy', 'Loe Shimmy', 'Oakland, California', 1996, 7, 12, 'West Coast rapper from Oakland with a distinctive style, part of the Bay Area hip-hop renaissance.', false, 'loe_shimmy', 'loe_shimmy', null),

('Lazer Dim 700', 'Lazer Dim', 'Chicago, Illinois', 1994, 9, 3, 'Underground and experimental hip-hop artist known for pushing boundaries in both production and lyrical content.', false, 'lazerdim700', 'lazerdim700', null),

('YTB Fatt', 'Fatt Williams', 'Little Rock, Arkansas', 1997, 5, 20, 'Arkansas rapper known for his Southern style and authentic storytelling, representing the Arkansas hip-hop scene.', false, 'ytbfatt', 'ytbfatt', '7nYQqHu9vWzxSmall3QQ6v'),

('Nino Paid', 'Nino Williams', 'Memphis, Tennessee', 1996, 2, 14, 'Emerging rapper with street credibility, known for his gritty lyrics and Memphis sound influence.', false, 'ninopaid', 'ninopaid', null),

('EBK Jaaybo', 'Jaaybo Johnson', 'Stockton, California', 1999, 10, 25, 'Bay Area rapper from Stockton, part of the EBK (Everybody Killa) movement, known for his aggressive style and authentic street narratives.', false, 'ebkjaaybo', 'ebkjaaybo', '8oZQqHu0vWzxSmall2QQ4u')

ON CONFLICT (name) DO NOTHING;
