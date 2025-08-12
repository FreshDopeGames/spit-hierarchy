-- Add safe cover art metadata fields to albums table
ALTER TABLE albums 
ADD COLUMN has_cover_art BOOLEAN DEFAULT FALSE,
ADD COLUMN cover_art_colors JSONB DEFAULT NULL,
ADD COLUMN external_cover_links JSONB DEFAULT NULL;

-- Update the table to set has_cover_art based on existing cover_art_url
UPDATE albums 
SET has_cover_art = (cover_art_url IS NOT NULL AND cover_art_url != '');

-- Add comment for documentation
COMMENT ON COLUMN albums.has_cover_art IS 'Indicates if cover art exists on external services';
COMMENT ON COLUMN albums.cover_art_colors IS 'Primary color palette for theming';
COMMENT ON COLUMN albums.external_cover_links IS 'Links to official cover art sources';