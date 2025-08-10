import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RapperTag {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export const useRapperTags = (rapperId: string) => {
  return useQuery({
    queryKey: ["rapper-tags", rapperId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rapper_tag_assignments")
        .select(`
          rapper_tags (
            id,
            name,
            slug,
            color
          )
        `)
        .eq("rapper_id", rapperId);
      
      if (error) throw error;
      
      return (data || [])
        .map(item => item.rapper_tags)
        .filter(Boolean) as RapperTag[];
    },
    enabled: !!rapperId,
  });
};