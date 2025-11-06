-- Add foreign key constraint from blog_posts.author_id to profiles.id
ALTER TABLE public.blog_posts
ADD CONSTRAINT fk_blog_posts_author
FOREIGN KEY (author_id)
REFERENCES public.profiles(id)
ON DELETE SET NULL;