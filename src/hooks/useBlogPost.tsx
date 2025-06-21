
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image_url: string;
  published_at: string;
  author_id: string;
  category_id: string;
  blog_categories?: {
    name: string;
  };
  blog_post_tags?: Array<{
    blog_tags: {
      name: string;
      slug: string;
    };
  }>;
}

export const useBlogPost = (id: string | undefined) => {
  return useQuery({
    queryKey: ['blog-post', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          content,
          excerpt,
          featured_image_url,
          published_at,
          author_id,
          category_id,
          blog_categories(name),
          blog_post_tags(
            blog_tags(
              name,
              slug
            )
          )
        `)
        .eq('id', id)
        .eq('status', 'published')
        .maybeSingle();
      
      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!id
  });
};
