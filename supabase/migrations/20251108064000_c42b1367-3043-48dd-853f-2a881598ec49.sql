-- Add homepage_url column to rappers table
ALTER TABLE rappers ADD COLUMN homepage_url TEXT;

-- Remove twitter_handle column from rappers table
ALTER TABLE rappers DROP COLUMN IF EXISTS twitter_handle;

-- Add comment for documentation
COMMENT ON COLUMN rappers.homepage_url IS 'Official homepage URL from MusicBrainz artist profile';