
-- Add video_url field to blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN video_url TEXT;

-- Update the column to allow null values (it's already nullable by default)
COMMENT ON COLUMN public.blog_posts.video_url IS 'URL for video content that can replace the featured image';
