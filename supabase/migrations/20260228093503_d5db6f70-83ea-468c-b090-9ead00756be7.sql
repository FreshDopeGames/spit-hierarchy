-- Add flag for unofficial/bootleg mixtapes pending review
ALTER TABLE public.albums 
ADD COLUMN is_flagged_unofficial boolean NOT NULL DEFAULT false;

-- Add a review notes column for admin context
ALTER TABLE public.albums
ADD COLUMN unofficial_flag_reason text DEFAULT NULL;

-- Index for quick lookups of flagged items
CREATE INDEX idx_albums_flagged_unofficial ON public.albums (is_flagged_unofficial) WHERE is_flagged_unofficial = true;