
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image_url: string;
  video_url: string;
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

export const useBlogPost = (id: string | undefined, canViewDrafts: boolean = false) => {
  return useQuery({
    queryKey: ['blog-post', id, canViewDrafts],
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          content,
          excerpt,
          featured_image_url,
          video_url,
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
        .eq('id', id);
      
      // Only filter by published status if user cannot view drafts
      if (!canViewDrafts) {
        query = query.eq('status', 'published');
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!id
  });
};
