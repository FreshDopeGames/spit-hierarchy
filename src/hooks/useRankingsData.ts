
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
          const { data: itemsData, error: itemsError } = await supabase
            .from("ranking_items")
            .select(`
              *,
              rapper:rappers(*)
            `)
            .eq("ranking_id", ranking.id)
            .eq("is_ranked", true) // Only get manually ranked items for preview
            .order("position")
            .limit(5); // Only get top 5 for display

          if (itemsError) {
            console.error(`Error fetching items for ranking ${ranking.id}:`, itemsError);
            return { ...ranking, items: [] };
          }

          return { ...ranking, items: itemsData || [] };
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
