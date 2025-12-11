-- Remove bootleg releases from Kanye West's discography
-- These were incorrectly imported because the filtering logic didn't reject explicit bootlegs

-- YE-VANGELION (bootleg fan compilation)
DELETE FROM rapper_albums 
WHERE rapper_id = 'd185abe0-ff8a-44bb-8e37-d77affe87727'
  AND album_id IN (SELECT id FROM albums WHERE musicbrainz_id = '6dffc036-58c5-4bdf-914c-31fdbb55e9fc');

-- God's Country (Josh Kori bootleg compilation)
DELETE FROM rapper_albums 
WHERE rapper_id = 'd185abe0-ff8a-44bb-8e37-d77affe87727'
  AND album_id IN (SELECT id FROM albums WHERE musicbrainz_id = 'abe7865c-84ad-4a28-b9f4-e85e2355423e');

-- thªnk g0d for drUgs (benny_gz24's bootleg version)
DELETE FROM rapper_albums 
WHERE rapper_id = 'd185abe0-ff8a-44bb-8e37-d77affe87727'
  AND album_id IN (SELECT id FROM albums WHERE musicbrainz_id = '090f2b73-c497-4ac8-af33-ced3d0edc1b7');

-- YESUKE (bootleg)
DELETE FROM rapper_albums 
WHERE rapper_id = 'd185abe0-ff8a-44bb-8e37-d77affe87727'
  AND album_id IN (SELECT id FROM albums WHERE musicbrainz_id = '1a726d8a-e574-486c-85fe-8dd263af3cb0');