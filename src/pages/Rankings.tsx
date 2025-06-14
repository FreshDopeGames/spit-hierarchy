
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import RankingHeader from "@/components/rankings/RankingHeader";
import OfficialRankingsSection from "@/components/rankings/OfficialRankingsSection";
import UserRankingsSection from "@/components/rankings/UserRankingsSection";
import RankingDetailView from "@/components/rankings/RankingDetailView";
import { useUserRankings } from "@/hooks/useUserRankings";

type OfficialRanking = Tables<"official_rankings">;
type RankingItem = Tables<"ranking_items"> & {
  rapper: Tables<"rappers">;
};

interface RankingWithItems extends OfficialRanking {
  items: RankingItem[];
}

const Rankings = () => {
  const { user } = useAuth();
  const [selectedRanking, setSelectedRanking] = useState<string | null>(null);
  const [officialRankings, setOfficialRankings] = useState<RankingWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  // Use the updated hook for user rankings
  const { data: userRankings = [], isLoading: userRankingsLoading } = useUserRankings();

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

      setOfficialRankings(rankingsWithItems);
    } catch (error) {
      console.error("Error fetching official rankings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Transform database data to match component props
  const transformedOfficialRankings = officialRankings.map((ranking) => ({
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

  // Combine all rankings for selection (user rankings are already transformed)
  const allRankings = [...transformedOfficialRankings, ...userRankings];
  const selectedRankingData = allRankings.find(r => r.id === selectedRanking);

  if (selectedRanking && selectedRankingData) {
    return (
      <RankingDetailView 
        ranking={selectedRankingData}
        onBack={() => setSelectedRanking(null)}
      />
    );
  }

  if (loading || userRankingsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon flex items-center justify-center">
        <div className="text-rap-gold font-mogra text-xl">Loading rankings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon relative">
      <div className="absolute inset-0 bg-gradient-to-br from-rap-carbon/80 via-rap-carbon-light/80 to-rap-carbon/80 z-0"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-carbon-fiber/90 border-b border-rap-gold/30 p-4 shadow-lg shadow-rap-gold/20">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 text-rap-gold hover:text-rap-gold-light transition-colors font-kaushan">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            
            {user && (
              <Button className="bg-rap-gold hover:bg-rap-gold-light text-rap-carbon font-mogra shadow-xl shadow-rap-gold/40 border border-rap-gold/30">
                <Plus className="w-4 h-4 mr-2" />
                Create Ranking
              </Button>
            )}
          </div>
        </header>

        <main className="max-w-6xl mx-auto p-6 pt-24">
          <RankingHeader 
            title="Top Rapper Rankings"
            description="Discover comprehensive rapper rankings with every artist in our database. Official rankings now include all 112+ rappers, while community rankings let you create your own complete lists."
          />

          <OfficialRankingsSection 
            rankings={transformedOfficialRankings}
            onRankingClick={setSelectedRanking}
          />

          <UserRankingsSection 
            rankings={userRankings}
            onRankingClick={setSelectedRanking}
          />
        </main>
      </div>
    </div>
  );
};

export default Rankings;
