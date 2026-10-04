
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
  status: string;
  profiles?: {
    username: string;
    first_name: string | null;
  };
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
          status,
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
        query = query.eq('status', 'published').lte('published_at', new Date().toISOString());
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error) throw error;
      if (!data) return null;

      const { data: author, error: authorError } = data.author_id
        ? await supabase.rpc('get_public_profile_safe', { profile_user_id: data.author_id }).maybeSingle()
        : { data: null, error: null };
      if (authorError) console.error('Could not load blog author', authorError);
      return { ...data, profiles: author ? { username: author.username, first_name: author.first_name } : undefined } as BlogPost;
    },
    enabled: !!id
  });
};
