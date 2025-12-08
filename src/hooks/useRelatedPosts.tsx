
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRelatedPosts = (categoryId: string | undefined, currentPostId: string | undefined) => {
  return useQuery({
    queryKey: ['related-posts', categoryId, currentPostId],
    queryFn: async () => {
      if (!currentPostId) return [];
      
      // First try to get posts from the same category
      if (categoryId) {
        const { data: sameCategoryPosts, error: sameCategoryError } = await supabase
          .from('blog_posts')
          .select(`
            id,
            title,
            excerpt,
            featured_image_url,
            published_at,
            slug
          `)
          .eq('status', 'published')
          .eq('category_id', categoryId)
          .neq('id', currentPostId)
          .order('published_at', { ascending: false })
          .limit(3);
        
        if (sameCategoryError) throw sameCategoryError;
        
        // If we found posts in the same category, return them
        if (sameCategoryPosts && sameCategoryPosts.length > 0) {
          return sameCategoryPosts;
        }
      }
      
      // Fallback: get recent posts from any category
      const { data: fallbackPosts, error: fallbackError } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          excerpt,
          featured_image_url,
          published_at,
          slug
        `)
        .eq('status', 'published')
        .neq('id', currentPostId)
        .order('published_at', { ascending: false })
        .limit(3);
      
      if (fallbackError) throw fallbackError;
      return fallbackPosts || [];
    },
    enabled: !!currentPostId
  });
};
