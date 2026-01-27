
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RankingWithItems } from "@/types/rankings";
import { useOptimizedUserRankings } from "./useOptimizedUserRankings";

export const useRankingsData = () => {
  const [officialRankings, setOfficialRankings] = useState<RankingWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  // Use the optimized hook for user rankings
  const {
    data: userRankingData,
    isLoading: userRankingsLoading,
  } = useOptimizedUserRankings();

  useEffect(() => {
    fetchOfficialRankings();
  }, []);

  const fetchOfficialRankings = async () => {
    try {
      // Fetch all official rankings
      const { data: rankingsData, error: rankingsError } = await supabase
        .from("official_rankings")
        .select("*")
        .order("display_order", { ascending: true });

      if (rankingsError) throw rankingsError;

      // Fetch items for each ranking
      const rankingsWithItems = await Promise.all(
        (rankingsData || []).map(async ranking => {
          // Fetch items sorted by actual votes using RPC
          const { data: itemsData, error: itemsError } = await supabase.rpc(
            'get_official_ranking_preview_items',
            { ranking_uuid: ranking.id, item_limit: 5 }
          );

          if (itemsError) {
            console.error(`Error fetching items for ranking ${ranking.id}:`, itemsError);
          }

          // Transform RPC response to match existing format with required fields
          const formattedItems = (itemsData || []).map((item: any) => ({
            id: item.id,
            position: item.item_position,
            reason: item.reason || null,
            is_ranked: item.is_ranked ?? true,
            ranking_votes: item.ranking_votes,
            // Add required fields with defaults for type compatibility
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ranking_id: ranking.id,
            rapper_id: item.rapper_id,
            vote_velocity_24_hours: null,
            vote_velocity_7_days: null,
            rapper: {
              id: item.rapper_id,
              name: item.rapper_name,
              image_url: item.rapper_image_url,
              slug: item.rapper_slug
            }
          })) as any;

          // Get vote count for this ranking
          const { data: voteCount } = await supabase
            .rpc('get_official_ranking_vote_count', { ranking_uuid: ranking.id });

          // Get total rapper count for this ranking
          const { count: totalRappers } = await supabase
            .from("ranking_items")
            .select("*", { count: "exact", head: true })
            .eq("ranking_id", ranking.id);

          return { 
            ...ranking, 
            items: formattedItems,
            totalVotes: voteCount || 0,
            totalRappers: totalRappers || 0
          };
        })
      );

      setOfficialRankings(rankingsWithItems);
    } catch (error) {
      console.error("Error fetching official rankings:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    officialRankings,
    userRankingData,
    loading: loading || userRankingsLoading
  };
};
