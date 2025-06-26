
-- Create a table to track blog post likes
CREATE TABLE public.blog_post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Add Row Level Security
ALTER TABLE public.blog_post_likes ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view all likes (for counting)
CREATE POLICY "Anyone can view blog post likes" 
  ON public.blog_post_likes 
  FOR SELECT 
  USING (true);

-- Policy to allow authenticated users to insert their own likes
CREATE POLICY "Users can like blog posts" 
  ON public.blog_post_likes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own likes
CREATE POLICY "Users can unlike blog posts" 
  ON public.blog_post_likes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add likes_count column to blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN likes_count INTEGER DEFAULT 0;

-- Create function to update likes count
CREATE OR REPLACE FUNCTION update_blog_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.blog_posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.blog_posts 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update likes count
CREATE TRIGGER update_blog_post_likes_count_trigger
  AFTER INSERT OR DELETE ON public.blog_post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_post_likes_count();
