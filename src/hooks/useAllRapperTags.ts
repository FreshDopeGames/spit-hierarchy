import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RapperTag {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export const useAllRapperTags = () => {
  return useQuery({
    queryKey: ["all-rapper-tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rapper_tags")
        .select("id, name, slug, color")
        .order("name");
      
      if (error) throw error;
      
      return (data || []) as RapperTag[];
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });
};
