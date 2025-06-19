import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdaptivePolling } from "./useAdaptivePolling";

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
  ranking_votes: number;
  dynamic_position: number;
}

export const useRankingData = (rankingId: string) => {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  const { refetchInterval, refetchIntervalInBackground } = useAdaptivePolling({
    baseInterval: 15000, // Increased from 5s to 15s
    maxInterval: 120000, // Max 2 minutes
    enabled: !!rankingId
  });

  const query = useQuery({
    queryKey: ["ranking-data-with-deltas", rankingId],
    queryFn: async () => {
      // Get all ranking items with rapper data and calculate weighted votes
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
        .eq("ranking_id", rankingId);

      if (error) throw error;

      // Get weighted vote counts for this specific ranking
      const { data: voteData, error: voteError } = await supabase
        .from("ranking_votes")
        .select("rapper_id, vote_weight")
        .eq("ranking_id", rankingId);

      if (voteError) throw voteError;

      // Aggregate vote counts by rapper
      const voteCounts: Record<string, number> = {};
      voteData.forEach(vote => {
        voteCounts[vote.rapper_id] = (voteCounts[vote.rapper_id] || 0) + vote.vote_weight;
      });

      // Get position deltas and enhance with vote data
      const itemsWithVotesAndDeltas = await Promise.all(
        (items || []).map(async (item) => {
          const { data: deltaResult } = await supabase.rpc("get_position_delta", {
            p_ranking_id: rankingId,
            p_rapper_id: item.rapper?.id
          });

          const ranking_votes = voteCounts[item.rapper?.id] || 0;

          return {
            ...item,
            position_delta: deltaResult || 0,
            ranking_votes,
            dynamic_position: 0 // Will be set after sorting
          } as RankingItemWithDelta;
        })
      );

      // Sort by weighted votes (descending) and assign dynamic positions
      const sortedItems = itemsWithVotesAndDeltas
        .sort((a, b) => b.ranking_votes - a.ranking_votes)
        .map((item, index) => ({
          ...item,
          dynamic_position: index + 1
        }));

      return sortedItems;
    },
    refetchInterval,
    refetchIntervalInBackground,
    staleTime: 10 * 60 * 1000, // 10 minutes - longer stale time
    refetchOnWindowFocus: false, // Disable refetch on window focus
  });

  // Set up real-time subscription for both rappers and ranking_votes table updates
  useEffect(() => {
    if (!rankingId || !query.data) return;

    // Get rapper IDs from current ranking
    const rapperIds = query.data.map(item => item.rapper?.id).filter(Boolean);
    
    if (rapperIds.length === 0) return;

    // Create a channel for real-time updates
    channelRef.current = supabase
      .channel(`ranking-${rankingId}-updates`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rappers',
          filter: `id=in.(${rapperIds.join(',')})`
        },
        (payload) => {
          console.log('Real-time rapper update received:', payload);
          // Invalidate and refetch to get updated ordering
          queryClient.invalidateQueries({ queryKey: ["ranking-data-with-deltas", rankingId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ranking_votes',
          filter: `ranking_id=eq.${rankingId}`
        },
        (payload) => {
          console.log('Real-time ranking vote update received:', payload);
          // Invalidate and refetch to get updated ordering
          queryClient.invalidateQueries({ queryKey: ["ranking-data-with-deltas", rankingId] });
        }
      )
      .subscribe();

    // Cleanup subscription on unmount or dependency change
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [rankingId, query.data, queryClient]);

  return query;
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
