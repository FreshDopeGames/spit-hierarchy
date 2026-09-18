
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RapperStats {
  top5_count: number;
  ranking_votes: number;
  actual_votes: number;
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

      // Fetch aggregated ranking vote weights (no voter identities exposed)
      const { data: votesData, error: votesError } = await supabase
        .rpc("get_ranking_vote_weights_for_rappers", { p_rapper_ids: rapperIds });

      if (votesError) throw votesError;

      const rankingVotes = (votesData || []).reduce((acc: Record<string, number>, item: any) => {
        acc[item.rapper_id] = Number(item.total_weight);
        return acc;
      }, {});

      // Fetch actual vote counts from rappers table
      const { data: rapperData, error: rapperError } = await supabase
        .from("rappers")
        .select("id, total_votes")
        .in("id", rapperIds);

      if (rapperError) throw rapperError;

      // Map actual votes per rapper
      const actualVotes = rapperData.reduce((acc: Record<string, number>, item) => {
        acc[item.id] = item.total_votes || 0;
        return acc;
      }, {});

      // Combine the data
      const statsMap: Record<string, RapperStats> = {};
      rapperIds.forEach(id => {
        statsMap[id] = {
          top5_count: top5Counts[id] || 0,
          ranking_votes: rankingVotes[id] || 0,
          actual_votes: actualVotes[id] || 0,
        };
      });

      return statsMap;
    },
    enabled: rapperIds.length > 0,
  });
};
