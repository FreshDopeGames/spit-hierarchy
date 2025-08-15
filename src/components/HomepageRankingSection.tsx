import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdaptivePolling } from "@/hooks/useAdaptivePolling";
import RankingPreviewCard from "./RankingPreviewCard";
import { Tables } from "@/integrations/supabase/types";

type OfficialRanking = Tables<"official_rankings">;
type RankingItem = Tables<"ranking_items"> & {
  rapper: Tables<"rappers">;
};

interface RankingWithItems extends OfficialRanking {
  items: RankingItem[];
  totalVotes: number;
}

const HomepageRankingSection = () => {
  const { refetchInterval } = useAdaptivePolling({ 
    baseInterval: 30000, 
    maxInterval: 60000, 
    enabled: true 
  });
  
  const { data: rankingsData = [], isLoading } = useQuery({
    queryKey: ["homepage-rankings-preview"],
    queryFn: async () => {
      console.log("🔄 Fetching homepage rankings preview...");
      
      // Fetch top 3 official rankings by display order
      const { data: rankingsData, error: rankingsError } = await supabase
        .from("official_rankings")
        .select("*")
        .order("display_order", { ascending: true })
        .limit(3);

      if (rankingsError) {
        console.error("❌ Error fetching rankings:", rankingsError);
        throw rankingsError;
      }

      if (!rankingsData || rankingsData.length === 0) {
        console.log("📭 No rankings found");
        return [];
      }

      // For each ranking, fetch the top 5 items with vote data
      const rankingsWithItems = await Promise.all(
        rankingsData.map(async (ranking) => {
          console.log(`🎯 Fetching items for ranking: ${ranking.title}`);
          
          // Get ranking items with rapper data
          const { data: itemsData, error: itemsError } = await supabase
            .from("ranking_items")
            .select(`
              position,
              rapper:rappers(*)
            `)
            .eq("ranking_id", ranking.id)
            .eq("is_ranked", true)
            .order("position")
            .limit(5);

          if (itemsError) {
            console.error(`❌ Error fetching items for ranking ${ranking.id}:`, itemsError);
            return { ...ranking, items: [], totalVotes: 0 };
          }

          // Get total vote count for this ranking
          const { count: totalVotes } = await supabase
            .from("ranking_votes")
            .select("*", { count: "exact" })
            .eq("ranking_id", ranking.id);

          const processedItems = (itemsData || []).map(item => ({
            rapper: item.rapper,
            position: item.position,
            votes: 0 // We could add individual vote counts here if needed
          }));

          console.log(`✅ Found ${processedItems.length} items for ${ranking.title} with ${totalVotes} total votes`);

          return {
            ...ranking,
            items: processedItems,
            totalVotes: totalVotes || 0
          };
        })
      );

      console.log(`🎉 Successfully loaded ${rankingsWithItems.length} rankings for homepage`);
      return rankingsWithItems;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval,
    refetchOnWindowFocus: false
  });

  if (isLoading) {
    return (
      <section className="mb-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-rap-platinum font-mogra mb-2">
            Featured Rankings
          </h2>
          <p className="text-rap-smoke font-kaushan">
            Discover the top rapper rankings voted by the community
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[300px] sm:h-[350px] md:h-[400px] rounded-xl bg-rap-carbon/20 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (!rankingsData || rankingsData.length === 0) {
    return null;
  }

  return (
    <section className="mb-16">
      <div className="mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-rap-platinum font-mogra mb-2">
          Featured Rankings
        </h2>
        <p className="text-rap-smoke font-kaushan">
          Discover the top rapper rankings voted by the community
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
        {rankingsData.map((ranking) => (
          <RankingPreviewCard
            key={ranking.id}
            ranking={ranking}
            items={ranking.items}
            totalVotes={ranking.totalVotes}
          />
        ))}
      </div>
    </section>
  );
};

export default HomepageRankingSection;