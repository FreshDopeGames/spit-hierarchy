
-- Link the 5 missing albums to 2Pac
INSERT INTO public.rapper_albums (rapper_id, album_id, role)
VALUES 
  ('ab50cc01-53d7-4cb1-8ed6-d57a9fd0a109', '08f9b32e-5f9a-46cf-84d6-63b2567e9400', 'primary'), -- Me Against the World (1995)
  ('ab50cc01-53d7-4cb1-8ed6-d57a9fd0a109', '0fcdbce7-2965-44b0-84a9-6b11f69793d0', 'primary'), -- All Eyez on Me (1996)
  ('ab50cc01-53d7-4cb1-8ed6-d57a9fd0a109', 'f8f6fcd7-8429-4794-9465-24fcf5f8897c', 'primary'), -- R U Still Down? (Remember Me) (1997)
  ('ab50cc01-53d7-4cb1-8ed6-d57a9fd0a109', '3a59c00b-7488-45b2-8097-a057b7546056', 'primary'), -- Until the End of Time (2001)
  ('ab50cc01-53d7-4cb1-8ed6-d57a9fd0a109', '8f99453d-647e-4207-8d67-2ef3623593e6', 'primary')  -- Better Dayz (2002)
ON CONFLICT (rapper_id, album_id) DO NOTHING;

-- Reclassify the 3 mixtapes as albums (2Pac didn't release mixtapes - these are posthumous compilations)
UPDATE public.albums
SET release_type = 'album', updated_at = NOW()
WHERE id IN (
  '3d425098-78a0-414a-af1c-85be569d6a40', -- Stop the Gunfight
  '2f084a45-f8e1-4b35-b311-5d42fc122055', -- Everyday
  '51509aba-29c7-4620-b1b9-d013b90192b9'  -- One Nation
);
