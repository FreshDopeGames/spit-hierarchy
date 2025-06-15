
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
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
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  const query = useQuery({
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
    },
    refetchInterval: 5000, // Fallback polling every 5 seconds
    refetchIntervalInBackground: true,
  });

  // Set up real-time subscription for rappers table updates
  useEffect(() => {
    if (!rankingId || !query.data) return;

    // Get rapper IDs from current ranking
    const rapperIds = query.data.map(item => item.rapper?.id).filter(Boolean);
    
    if (rapperIds.length === 0) return;

    // Create a channel for real-time updates
    channelRef.current = supabase
      .channel(`ranking-${rankingId}-votes`)
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
          
          // Update the specific rapper in the cache
          queryClient.setQueryData(
            ["ranking-data-with-deltas", rankingId],
            (oldData: RankingItemWithDelta[] | undefined) => {
              if (!oldData) return oldData;
              
              return oldData.map(item => {
                if (item.rapper?.id === payload.new.id) {
                  return {
                    ...item,
                    rapper: {
                      ...item.rapper,
                      total_votes: payload.new.total_votes
                    }
                  };
                }
                return item;
              });
            }
          );
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
