import { useOptimizedQuery } from "./useOptimizedQuery";
import { supabase } from "@/integrations/supabase/client";

export interface MostViewedRapper {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  view_count: number;
}

export const useMostViewedRappers = (limit = 5) => {
  return useOptimizedQuery({
    queryKey: ["most-viewed-rappers", limit],
    priority: 'low',
    queryFn: async (): Promise<MostViewedRapper[]> => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: views, error: viewsError } = await supabase
        .from("rapper_page_views")
        .select("rapper_id")
        .gte("viewed_at", sevenDaysAgo.toISOString());

      if (viewsError) throw viewsError;
      if (!views || views.length === 0) return [];

      // Group by rapper_id and count
      const counts: Record<string, number> = {};
      for (const v of views) {
        counts[v.rapper_id] = (counts[v.rapper_id] || 0) + 1;
      }

      const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);

      const topIds = sorted.map(([id]) => id);

      const { data: rappers, error: rappersError } = await supabase
        .from("rappers")
        .select("id, name, slug, image_url")
        .in("id", topIds);

      if (rappersError) throw rappersError;

      const rapperMap = new Map(rappers?.map((r) => [r.id, r]));

      return sorted.map(([id, count]) => {
        const r = rapperMap.get(id);
        return {
          id,
          name: r?.name ?? "Unknown",
          slug: r?.slug ?? id,
          image_url: r?.image_url ?? null,
          view_count: count,
        };
      });
    },
    staleTime: 5 * 60 * 1000,
  });
};
