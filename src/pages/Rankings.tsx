
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

type OfficialRanking = Tables<"official_rankings">;
type RankingItem = Tables<"ranking_items"> & {
  rapper: Tables<"rappers">;
};

interface RankingWithItems extends OfficialRanking {
  items: RankingItem[];
}

// Mock data for user-generated rankings
const userRankings = [
  {
    id: "1",
    title: "Top 10 G.O.A.T. Rappers of All Time",
    description: "My personal ranking of the greatest rappers ever, based on lyricism, influence, and cultural impact.",
    author: "HipHopHead92",
    authorId: "user1",
    createdAt: "2024-01-15",
    timeAgo: "3 days ago",
    rappers: [
      { rank: 1, name: "Nas", reason: "Illmatic alone secures his spot" },
      { rank: 2, name: "Jay-Z", reason: "Business acumen and longevity" },
      { rank: 3, name: "Biggie", reason: "Storytelling master" },
      { rank: 4, name: "Tupac", reason: "Raw emotion and social consciousness" },
      { rank: 5, name: "Eminem", reason: "Technical skill and wordplay" },
    ],
    likes: 247,
    comments: 89,
    views: 1240,
    isPublic: true,
    isOfficial: false,
    tags: ["GOAT", "Classic Hip-Hop", "All-Time"]
  },
  {
    id: "2",
    title: "Best New School Rappers (2020-2024)",
    description: "Rising stars who are shaping the future of hip-hop right now.",
    author: "NextGenMusic",
    authorId: "user2",
    createdAt: "2024-01-10",
    timeAgo: "1 week ago",
    rappers: [
      { rank: 1, name: "Baby Keem", reason: "Innovative sound and production" },
      { rank: 2, name: "JID", reason: "Incredible flow and technical ability" },
      { rank: 3, name: "Denzel Curry", reason: "Versatility and energy" },
      { rank: 4, name: "Vince Staples", reason: "Unique perspective and delivery" },
      { rank: 5, name: "Earl Sweatshirt", reason: "Artistic evolution and depth" },
    ],
    likes: 156,
    comments: 34,
    views: 890,
    isPublic: true,
    isOfficial: false,
    tags: ["New School", "2020s", "Rising Stars"]
  },
  {
    id: "3",
    title: "Best Lyricists in Hip-Hop",
    description: "Ranking rappers purely on their lyrical ability and wordplay.",
    author: "WordplayWizard",
    authorId: "user3",
    createdAt: "2024-01-08",
    timeAgo: "1 week ago",
    rappers: [
      { rank: 1, name: "MF DOOM", reason: "Complex wordplay and metaphors" },
      { rank: 2, name: "Kendrick Lamar", reason: "Storytelling and social commentary" },
      { rank: 3, name: "Black Thought", reason: "Consistent excellence" },
      { rank: 4, name: "Andre 3000", reason: "Creative and unpredictable" },
      { rank: 5, name: "Lupe Fiasco", reason: "Double entendres and complexity" },
    ],
    likes: 203,
    comments: 67,
    views: 1150,
    isPublic: true,
    isOfficial: false,
    tags: ["Lyricism", "Wordplay", "Technical"]
  }
];

const Rankings = () => {
  const { user } = useAuth();
  const [selectedRanking, setSelectedRanking] = useState<string | null>(null);
  const [officialRankings, setOfficialRankings] = useState<RankingWithItems[]>([]);
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

  // Combine all rankings for selection
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

  if (loading) {
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
              <Button className="bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-mogra text-rap-carbon shadow-xl shadow-rap-gold/40 border border-rap-gold/30">
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
