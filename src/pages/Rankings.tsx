
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import HeaderNavigation from "@/components/HeaderNavigation";
import RankingHeader from "@/components/rankings/RankingHeader";
import OfficialRankingsSection from "@/components/rankings/OfficialRankingsSection";
import UserRankingsSection from "@/components/rankings/UserRankingsSection";
import RankingDetailView from "@/components/rankings/RankingDetailView";
import { useOptimizedUserRankings } from "@/hooks/useOptimizedUserRankings";

type OfficialRanking = Tables<"official_rankings">;
type RankingItem = Tables<"ranking_items"> & {
  rapper: Tables<"rappers">;
};
interface RankingWithItems extends OfficialRanking {
  items: RankingItem[];
}

const Rankings = () => {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedRanking, setSelectedRanking] = useState<string | null>(null);
  const [officialRankings, setOfficialRankings] = useState<RankingWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  // Add scroll detection for header
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Transform database data to match component props
  const transformedOfficialRankings = officialRankings.map(ranking => ({
    id: ranking.id,
    title: ranking.title,
    description: ranking.description || "",
    author: "Editorial Team",
    timeAgo: new Date(ranking.created_at || "").toLocaleDateString(),
    rappers: ranking.items.map(item => ({
      rank: item.position,
      name: item.rapper?.name || "Unknown",
      reason: item.reason || ""
    })),
    likes: Math.floor(Math.random() * 1000) + 100, // Mock data for now
    views: Math.floor(Math.random() * 5000) + 1000, // Mock data for now
    isOfficial: true,
    tags: ["Official", ranking.category],
    slug: ranking.slug
  }));

  // Transform user rankings to match expected format
  const transformedUserRankings = (userRankingData?.rankings || []).map(ranking => ({
    id: ranking.id,
    title: ranking.title,
    description: ranking.description || "",
    author: ranking.profiles?.username || "Unknown User",
    authorId: ranking.user_id,
    createdAt: ranking.created_at,
    timeAgo: new Date(ranking.created_at).toLocaleDateString(),
    rappers: (ranking.preview_items || []).map((item, index) => ({
      rank: item.item_position,
      name: item.rapper_name,
      reason: item.item_reason || ""
    })),
    likes: Math.floor(Math.random() * 500) + 50,
    views: Math.floor(Math.random() * 2000) + 100,
    isOfficial: false,
    tags: ["Community", ranking.category],
    category: ranking.category,
    isPublic: ranking.is_public || false,
    slug: `user-${ranking.id}`
  }));

  // Combine all rankings for selection
  const allRankings = [...transformedOfficialRankings, ...transformedUserRankings];
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
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon overflow-x-hidden">
      {/* Sticky Header - same as home page */}
      <HeaderNavigation isScrolled={isScrolled} />

      {/* Main Content with increased top padding to account for fixed header */}
      <main className="pt-20 sm:pt-24 w-full overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 pt-8 sm:pt-12 lg:pt-16">
          
          {/* Back to Home Link */}
          <div className="mb-8">
            <Link to="/" className="flex items-center space-x-2 text-rap-gold hover:text-rap-gold-light transition-colors font-kaushan">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
          </div>

          <RankingHeader 
            title="Top Rapper Rankings" 
            description="Discover comprehensive rapper rankings with every artist in our database. Official rankings now include all 112+ rappers, while community rankings let you create your own complete lists." 
          />

          <OfficialRankingsSection 
            rankings={transformedOfficialRankings} 
            onRankingClick={setSelectedRanking} 
          />

          <UserRankingsSection 
            rankings={transformedUserRankings} 
            onRankingClick={setSelectedRanking} 
            hasNextPage={userRankingData?.hasMore || false} 
            onLoadMore={() => {}} 
            isLoadingMore={false} 
          />
        </div>
      </main>
    </div>
  );
};

export default Rankings;
