import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TagStats {
  name: string;
  count: number;
}

export const useTopTagsStats = () => {
  return useQuery({
    queryKey: ["top-tags-stats"],
    queryFn: async (): Promise<TagStats[]> => {
      const { data, error } = await supabase
        .from("rapper_tag_assignments")
        .select(`
          rapper_tags!inner(name)
        `);

      if (error) throw error;

      // Count occurrences of each tag
      const tagCounts: { [key: string]: number } = {};
      data.forEach(item => {
        if (item.rapper_tags?.name) {
          tagCounts[item.rapper_tags.name] = (tagCounts[item.rapper_tags.name] || 0) + 1;
        }
      });

      // Convert to array and sort by count
      const tagsArray = Object.entries(tagCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      return tagsArray;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};