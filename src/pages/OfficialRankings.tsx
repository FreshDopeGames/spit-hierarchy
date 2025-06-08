
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import RankingHeader from "@/components/rankings/RankingHeader";
import RankingCard from "@/components/rankings/RankingCard";

type OfficialRanking = Tables<"official_rankings">;
type RankingItem = Tables<"ranking_items"> & {
  rapper: Tables<"rappers">;
};

interface RankingWithItems extends OfficialRanking {
  items: RankingItem[];
}

const OfficialRankings = () => {
  const [rankings, setRankings] = useState<RankingWithItems[]>([]);
  const [loading, setLoading] = useState(true);

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
        (rankingsData || []).map(async (ranking) => {
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

      setRankings(rankingsWithItems);
    } catch (error) {
      console.error("Error fetching official rankings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRankingClick = (slug: string) => {
    // Navigation will be handled by the Link component in RankingCard
  };

  // Transform database data to match RankingCard props
  const transformedRankings = rankings.map((ranking) => ({
    id: ranking.id,
    title: ranking.title,
    description: ranking.description || "",
    author: "Editorial Team",
    timeAgo: new Date(ranking.created_at || "").toLocaleDateString(),
    rappers: ranking.items.map((item) => ({
      rank: item.position,
      name: item.rapper?.name || "Unknown",
      reason: item.reason || "",
    })),
    likes: Math.floor(Math.random() * 1000) + 100, // Mock data for now
    views: Math.floor(Math.random() * 5000) + 1000, // Mock data for now
    isOfficial: true,
    tags: ["Official", ranking.category],
    slug: ranking.slug,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon flex items-center justify-center">
        <div className="text-rap-gold font-mogra text-xl">Loading official rankings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      {/* Header */}
      <header className="bg-carbon-fiber/90 border-b border-rap-gold/30 p-4 shadow-lg shadow-rap-gold/20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/rankings">
            <Button
              variant="ghost"
              className="text-rap-gold hover:text-rap-gold-light font-kaushan"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Rankings
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <RankingHeader
          title="Official Rankings"
          description="Curated rankings created by our expert editorial team, featuring the most comprehensive and authoritative lists in hip-hop. Each list now includes every rapper in our database."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {transformedRankings.map((ranking) => (
            <Link key={ranking.id} to={`/rankings/official/${ranking.slug}`}>
              <RankingCard
                {...ranking}
                onClick={() => {}} // Not used since we're using Link
              />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default OfficialRankings;
