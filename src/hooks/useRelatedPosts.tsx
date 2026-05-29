
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRelatedPosts = (categoryId: string | undefined, currentPostId: string | undefined) => {
  return useQuery({
    queryKey: ['related-posts', categoryId, currentPostId],
    queryFn: async () => {
      if (!currentPostId) return [];

      const LIMIT = 3;
      const selectFields = `
        id,
        title,
        excerpt,
        featured_image_url,
        published_at,
        slug,
        category_id
      `;

      const collected: any[] = [];
      const seenIds = new Set<string>([currentPostId]);

      // 1) Prioritize same-category posts (most recent first)
      if (categoryId) {
        const { data: sameCategoryPosts, error: sameCategoryError } = await supabase
          .from('blog_posts')
          .select(selectFields)
          .eq('status', 'published')
          .lte('published_at', new Date().toISOString())
          .eq('category_id', categoryId)
          .neq('id', currentPostId)
          .order('published_at', { ascending: false })
          .limit(LIMIT);

        if (sameCategoryError) throw sameCategoryError;

        for (const post of sameCategoryPosts || []) {
          if (!seenIds.has(post.id)) {
            collected.push(post);
            seenIds.add(post.id);
          }
        }
      }

      // 2) Top up with recent posts from other categories if we have fewer than LIMIT
      if (collected.length < LIMIT) {
        let fallbackQuery = supabase
          .from('blog_posts')
          .select(selectFields)
          .eq('status', 'published')
          .lte('published_at', new Date().toISOString())
          .neq('id', currentPostId)
          .order('published_at', { ascending: false })
          .limit(LIMIT);

        if (categoryId) {
          fallbackQuery = fallbackQuery.neq('category_id', categoryId);
        }

        const { data: fallbackPosts, error: fallbackError } = await fallbackQuery;
        if (fallbackError) throw fallbackError;

        for (const post of fallbackPosts || []) {
          if (collected.length >= LIMIT) break;
          if (!seenIds.has(post.id)) {
            collected.push(post);
            seenIds.add(post.id);
          }
        }
      }

      return collected;
    },
    enabled: !!currentPostId
  });
};
