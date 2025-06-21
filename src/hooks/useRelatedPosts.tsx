
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRelatedPosts = (categoryId: string | undefined, currentPostId: string | undefined) => {
  return useQuery({
    queryKey: ['related-posts', categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          excerpt,
          featured_image_url,
          published_at
        `)
        .eq('status', 'published')
        .eq('category_id', categoryId)
        .neq('id', currentPostId)
        .order('published_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
    enabled: !!categoryId
  });
};
