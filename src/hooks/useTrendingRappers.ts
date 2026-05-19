import { useOptimizedQuery } from "./useOptimizedQuery";
import { supabase } from "@/integrations/supabase/client";

export interface TrendingRapper {
  id: string;
  rank: number;
  rapper_id: string;
  name: string;
  slug: string;
  image_url: string | null;
  mention_count: number;
  sources: string[];
  score: number;
  generated_at: string;
}

export const useTrendingRappers = () => {
  return useOptimizedQuery({
    queryKey: ["trending-rappers"],
    priority: "high",
    queryFn: async (): Promise<TrendingRapper[]> => {
      // Get latest snapshot timestamp
      const { data: latest, error: latestErr } = await supabase
        .from("trending_rappers")
        .select("generated_at")
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestErr) throw latestErr;
      if (!latest) return [];

      const { data: rows, error: rowsErr } = await supabase
        .from("trending_rappers")
        .select("id, rank, rapper_id, mention_count, sources, score, generated_at")
        .eq("generated_at", latest.generated_at)
        .order("rank", { ascending: true });

      if (rowsErr) throw rowsErr;
      if (!rows || rows.length === 0) return [];

      const ids = rows.map((r) => r.rapper_id);
      const { data: rappers, error: rappersErr } = await supabase
        .from("rappers")
        .select("id, name, slug, image_url")
        .in("id", ids);

      if (rappersErr) throw rappersErr;
      const rapperMap = new Map(rappers?.map((r) => [r.id, r]));

      return rows.map((row) => {
        const r = rapperMap.get(row.rapper_id);
        return {
          id: row.id,
          rank: row.rank,
          rapper_id: row.rapper_id,
          name: r?.name ?? "Unknown",
          slug: r?.slug ?? row.rapper_id,
          image_url: r?.image_url ?? null,
          mention_count: row.mention_count,
          sources: row.sources ?? [],
          score: Number(row.score),
          generated_at: row.generated_at,
        };
      });
    },
    staleTime: 15 * 60 * 1000,
  });
};
