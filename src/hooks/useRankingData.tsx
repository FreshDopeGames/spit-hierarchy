
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
// Sort items by votes (descending), then by position (for tie-breaking), then alphabetically
export const sortItemsByVotes = (items: RankingItemWithDelta[]): RankingItemWithDelta[] => {
  return [...items].sort((a, b) => {
    // Primary: most votes first
    if (b.ranking_votes !== a.ranking_votes) {
      return b.ranking_votes - a.ranking_votes;
    }
    // Secondary: earliest vote (lower position) first for items with same votes
    if (a.position !== b.position) {
      return a.position - b.position;
    }
    // Tertiary: alphabetically by name for 0-vote rappers
    return (a.rapper?.name || '').localeCompare(b.rapper?.name || '');
  });
};

export const calculateVisualRanks = (items: RankingItemWithDelta[]): RankingItemWithDelta[] => {
  // Items should already be sorted by votes before this function is called
  let currentVisualRank = 1;
  let previousVoteCount = -1;

  return items.map((item, index) => {
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
  });
  // No longer re-sorting back to database order - we want vote-based order
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

      // Sort items by votes first, then calculate visual ranks
      const sortedItems = sortItemsByVotes(itemsWithVotesAndDeltas);
      const itemsWithVisualRanks = calculateVisualRanks(sortedItems);

      // Add display_index based on the sorted order (by votes)
      const itemsWithDisplayIndex = itemsWithVisualRanks.map((item, index) => ({
        ...item,
        display_index: index + 1 // 1-based display order for premium styling
      }));

      return itemsWithDisplayIndex;
    },
    refetchInterval,
    refetchIntervalInBackground,
    staleTime: 30 * 1000, // 30 seconds - ensures vote-sorted data refreshes promptly
    refetchOnWindowFocus: true, // Re-enabled so tab switching shows fresh data
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
