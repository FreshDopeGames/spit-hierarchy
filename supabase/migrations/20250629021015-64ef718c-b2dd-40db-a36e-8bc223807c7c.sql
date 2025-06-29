
-- Add 7 established rappers with comprehensive data
INSERT INTO public.rappers (name, real_name, origin, birth_year, birth_month, birth_day, bio, verified, twitter_handle, instagram_handle, spotify_id) VALUES
('Joyner Lucas', 'Gary Maurice Lucas Jr.', 'Worcester, Massachusetts', 1988, 8, 17, 'Massachusetts rapper known for his rapid-fire delivery, intricate wordplay, and socially conscious lyrics. Famous for viral tracks like "I''m Not Racist" and "ADHD." Known for his storytelling ability and technical skill.', true, 'joynerlucas', 'joynerlucas', '5lgjuSfmSizP3QhefTBcaO'),

('Kevin Gates', 'Kevin Jerome Gilyard', 'Baton Rouge, Louisiana', 1986, 2, 5, 'Louisiana rapper known for his confessional style, prolific mixtape output, and authentic street narratives. Breakthrough album "Islah" featured hits like "2 Phones" and "Really Really." Known for his raw honesty and Southern rap influence.', true, 'iamkevingates', 'iamkevingates', '1URnnhqYAYcrqrcwql10ft'),

('Lil Durk', 'Durk Derrick Banks', 'Chicago, Illinois', 1992, 10, 19, 'Chicago drill rapper and leader of Only the Family (OTF). Known for his melodic rap style that helped evolve the drill genre. Albums like "The Voice" and collaborations with Drake, Lil Baby, and others have made him a mainstream star.', true, 'lildurk', 'lildurk', '3hcs9uc56yIGFCSy9leWe7'),

('Lil Yachty', 'Miles Parks McCollum', 'Mableton, Georgia', 1997, 8, 23, 'Atlanta rapper known for his colorful persona, melodic rap style, and bubblegum trap sound. Part of the SoundCloud rap movement with hits like "One Night" and "Minnesota." Known for his positive energy and genre-blending approach.', true, 'lilyachty', 'lilyachty', '1yxSLGMDHlW21z4YXirZDS'),

('Meek Mill', 'Robert Rihmeek Williams', 'Philadelphia, Pennsylvania', 1987, 5, 6, 'Philadelphia rapper known for his energetic delivery, street narratives, and criminal justice reform advocacy. Albums like "Dreams and Nightmares" established him as a major voice. Co-founded REFORM Alliance for justice reform.', true, 'meekmill', 'meekmill', '20sxb77xiYeusSH8cVdatc'),

('Rod Wave', 'Rodarius Marcell Green', 'St. Petersburg, Florida', 1999, 8, 27, 'Florida rapper known for his emotional, melodic style blending hip-hop with R&B and soul. Breakthrough hit "Heart on Ice" showcased his vulnerable approach. Albums like "Ghetto Gospel" and "SoulFly" have topped charts with his pain-filled anthems.', true, 'rodwave', 'rodwave', '1Xm1BPGLrqNtamKCmQzwhs'),

('Tink', 'Trinity Laure''Ale Home', 'Calumet City, Illinois', 1995, 3, 18, 'Chicago rapper and singer known for her versatile style blending rap and R&B. Former Timbaland protégé who gained attention with mixtapes like "Winter''s Diary." Known for her raw lyricism and melodic hooks representing female voices in hip-hop.', true, 'tinktherapper', 'tinktherapper', '2RZQM9hOWnKyRGYfLHT7hS')

ON CONFLICT (name) DO NOTHING;
