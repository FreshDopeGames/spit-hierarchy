-- Remove all unofficial albums and reset discography cache for all rappers
-- This will force a fresh fetch with stricter official-only filtering

-- Step 1: Delete all album tracks (will cascade properly with foreign keys)
DELETE FROM album_tracks;

-- Step 2: Delete all rapper-album associations
DELETE FROM rapper_albums;

-- Step 3: Delete all albums
DELETE FROM albums;

-- Step 4: Reset discography cache for all rappers to force re-fetch
UPDATE rappers 
SET discography_last_updated = NULL;