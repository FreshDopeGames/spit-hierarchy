
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useMemo, useCallback } from "react";
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
    slug?: string | null;
  };
  position_delta: number;
  ranking_votes: number;
  dynamic_position: number;
  visual_rank: number | null; // New field for visual ranking
  display_index?: number; // Display order for premium styling (1-5)
}

// Memoized function to calculate visual ranks based on vote counts
// This is expensive and should only recalculate when items actually change
const calculateVisualRanks = (items: RankingItemWithDelta[]): RankingItemWithDelta[] => {
  // Sort by vote count descending, then by position (which now uses earliest vote for tie-breaking)
  const sortedItems = [...items].sort((a, b) => {
    if (b.ranking_votes !== a.ranking_votes) {
      return b.ranking_votes - a.ranking_votes;
    }
    return a.position - b.position; // Use database position for tie-breaking order
  });

  let currentVisualRank = 1;
  let previousVoteCount = -1;

  return sortedItems.map((item, index) => {
    if (item.ranking_votes === 0) {
      // Rappers with 0 votes get null visual rank (will display as "–")
      return { ...item, visual_rank: null };
    }

    if (item.ranking_votes !== previousVoteCount) {
      // New vote count group - set visual rank to current position
      currentVisualRank = index + 1;
      previousVoteCount = item.ranking_votes;
    }
    // Same vote count as previous - keep same visual rank (no else needed)

    return { ...item, visual_rank: currentVisualRank };
  }).sort((a, b) => a.position - b.position); // Return to original database order
};

// Create a stable cache key from items to enable memoization
const getItemsCacheKey = (items: RankingItemWithDelta[]): string => {
  return items.map(item => `${item.id}:${item.ranking_votes}:${item.position}`).join('|');
};

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
      // Get all ranking items with rapper data - positions are calculated from votes
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
            total_votes,
            slug
          )
        `)
        .eq("ranking_id", rankingId)
        .order("position", { ascending: true }); // Use database position which is now properly sorted

      if (error) throw error;

      // Get aggregated vote counts from the view for this specific ranking
      const { data: voteData, error: voteError } = await supabase
        .from("ranking_vote_counts")
        .select("rapper_id, total_vote_weight")
        .eq("ranking_id", rankingId);

      if (voteError) throw voteError;

      // Create vote counts map from the aggregated data
      const voteCounts: Record<string, number> = {};
      voteData?.forEach(vote => {
        voteCounts[vote.rapper_id] = vote.total_vote_weight || 0;
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
            dynamic_position: item.position, // Use the database position directly
            visual_rank: null // Will be calculated below
          } as RankingItemWithDelta;
        })
      );

      // Calculate visual ranks for items with tied vote counts
      const itemsWithVisualRanks = calculateVisualRanks(itemsWithVotesAndDeltas);

      // Add display_index based on the current sort order (by position)
      const itemsWithDisplayIndex = itemsWithVisualRanks.map((item, index) => ({
        ...item,
        display_index: index + 1 // 1-based display order for premium styling
      }));

      return itemsWithDisplayIndex;
    },
    refetchInterval,
    refetchIntervalInBackground,
    staleTime: 5 * 60 * 1000, // 5 minutes - shorter since positions are now database-maintained
    refetchOnWindowFocus: false, // Disabled to prevent unnecessary refetches during tab switching
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
  // Memoize the threshold calculation - only recalculate when items change
  return useMemo(() => {
    // Calculate 85th percentile threshold for "hot" badges
    const velocities = items
      .map(item => item.vote_velocity_24_hours || 0)
      .filter(v => v > 0)
      .sort((a, b) => b - a);

    if (velocities.length === 0) return 0;

    const percentileIndex = Math.floor(velocities.length * 0.15); // 85th percentile
    return velocities[percentileIndex] || 0;
  }, [items]);
};
