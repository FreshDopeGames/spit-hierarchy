
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RapperStats {
  top5_count: number;
  ranking_votes: number;
}

export const useRapperStats = (rapperIds: string[]) => {
  return useQuery({
    queryKey: ["rapper-stats", rapperIds],
    queryFn: async () => {
      if (rapperIds.length === 0) return {};

      // Fetch Top 5 counts for all rappers
      const { data: top5Data, error: top5Error } = await supabase
        .from("user_top_rappers")
        .select("rapper_id")
        .in("rapper_id", rapperIds);

      if (top5Error) throw top5Error;

      // Count Top 5 occurrences per rapper
      const top5Counts = top5Data.reduce((acc: Record<string, number>, item) => {
        acc[item.rapper_id] = (acc[item.rapper_id] || 0) + 1;
        return acc;
      }, {});

      // Fetch ranking votes with vote weights for all rappers
      const { data: votesData, error: votesError } = await supabase
        .from("ranking_votes")
        .select("rapper_id, vote_weight")
        .in("rapper_id", rapperIds);

      if (votesError) throw votesError;

      // Sum weighted votes per rapper
      const rankingVotes = votesData.reduce((acc: Record<string, number>, item) => {
        acc[item.rapper_id] = (acc[item.rapper_id] || 0) + item.vote_weight;
        return acc;
      }, {});

      // Combine the data
      const statsMap: Record<string, RapperStats> = {};
      rapperIds.forEach(id => {
        statsMap[id] = {
          top5_count: top5Counts[id] || 0,
          ranking_votes: rankingVotes[id] || 0,
        };
      });

      return statsMap;
    },
    enabled: rapperIds.length > 0,
  });
};
