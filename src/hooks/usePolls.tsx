import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Poll {
  id: string;
  title: string;
  description: string;
  type: 'single_choice' | 'multiple_choice';
  status: 'draft' | 'active' | 'completed' | 'archived';
  placement: 'homepage' | 'all_blogs' | 'specific_blog';
  blog_post_id?: string;
  expires_at?: string;
  is_featured: boolean;
  allow_write_in?: boolean;
  created_at: string;
  poll_options: Array<{
    id: string;
    option_text: string;
    option_order: number;
  }>;
}

export const usePolls = (placement?: string, blogPostId?: string) => {
  return useQuery({
    queryKey: ['polls', placement, blogPostId],
    queryFn: async () => {
      let query = supabase
        .from('polls')
        .select(`
          id,
          title,
          description,
          type,
          status,
          placement,
          blog_post_id,
          expires_at,
          is_featured,
          allow_write_in,
          created_at,
          poll_options (
            id,
            option_text,
            option_order
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (placement) {
        query = query.eq('placement', placement);
      }

      if (blogPostId) {
        query = query.eq('blog_post_id', blogPostId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Poll[];
    }
  });
};

export const useFeaturedPolls = () => {
  return useQuery({
    queryKey: ['polls', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('polls')
        .select(`
          id,
          title,
          description,
          type,
          status,
          placement,
          expires_at,
          is_featured,
          allow_write_in,
          created_at,
          poll_options (
            id,
            option_text,
            option_order
          )
        `)
        .eq('status', 'active')
        .eq('is_featured', true)
        .eq('placement', 'homepage')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data as Poll[];
    }
  });
};