
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
    baseInterval: 15000, // 15 seconds
    maxInterval: 120000, // Max 2 minutes
    enabled: !!rankingId
  });

  const query = useQuery({
    queryKey: ["ranking-data-with-deltas", rankingId],
    queryFn: async () => {
      // Get all ranking items with rapper data - positions are now maintained by the database
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
        .order("position", { ascending: true }); // Use database position which is now properly sorted

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
            dynamic_position: item.position // Use the database position directly
          } as RankingItemWithDelta;
        })
      );

      // Return items in their database-sorted order (no need to re-sort)
      return itemsWithVotesAndDeltas;
    },
    refetchInterval,
    refetchIntervalInBackground,
    staleTime: 5 * 60 * 1000, // 5 minutes - shorter since positions are now database-maintained
    refetchOnWindowFocus: true, // Enable refetch on window focus for real-time feel
  });

  // Set up real-time subscription for ranking_votes table updates
  useEffect(() => {
    if (!rankingId || !query.data) return;

    // Create a channel for real-time updates
    channelRef.current = supabase
      .channel(`ranking-${rankingId}-updates`)
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
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ranking_items',
          filter: `ranking_id=eq.${rankingId}`
        },
        (payload) => {
          console.log('Real-time ranking items update received:', payload);
          // Invalidate and refetch when positions are updated
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
