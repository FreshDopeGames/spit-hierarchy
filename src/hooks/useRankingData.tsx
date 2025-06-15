
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RankingItemWithDelta {
  id: string;
  position: number;
  reason: string | null;
  is_ranked: boolean;
  vote_velocity_7_days: number | null;
  vote_velocity_24_hours: number | null;
  rapper: {
    id: string;
    name: string;
    origin: string | null;
    total_votes: number | null;
  };
  position_delta: number;
}

export const useRankingData = (rankingId: string) => {
  return useQuery({
    queryKey: ["ranking-data-with-deltas", rankingId],
    queryFn: async () => {
      // Get all ranking items with rapper data
      const { data: items, error } = await supabase
        .from("ranking_items")
        .select(`
          id,
          position,
          reason,
          is_ranked,
          vote_velocity_7_days,
          vote_velocity_24_hours,
          rapper:rappers (
            id,
            name,
            origin,
            total_votes
          )
        `)
        .eq("ranking_id", rankingId)
        .order("position");

      if (error) throw error;

      // Get position deltas for each item
      const itemsWithDeltas = await Promise.all(
        (items || []).map(async (item) => {
          const { data: deltaResult } = await supabase.rpc("get_position_delta", {
            p_ranking_id: rankingId,
            p_rapper_id: item.rapper?.id
          });

          return {
            ...item,
            position_delta: deltaResult || 0
          } as RankingItemWithDelta;
        })
      );

      return itemsWithDeltas;
    }
  });
};

export const useHotThreshold = (items: RankingItemWithDelta[]) => {
  // Calculate 85th percentile threshold for "hot" badges
  const velocities = items
    .map(item => item.vote_velocity_24_hours || 0)
    .filter(v => v > 0)
    .sort((a, b) => b - a);

  if (velocities.length === 0) return 0;

  const percentileIndex = Math.floor(velocities.length * 0.15); // 85th percentile
  return velocities[percentileIndex] || 0;
};
