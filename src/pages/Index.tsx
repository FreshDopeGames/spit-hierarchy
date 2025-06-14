
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import HeaderNavigation from "@/components/HeaderNavigation";
import HeroSection from "@/components/HeroSection";
import BlogCarousel from "@/components/BlogCarousel";
import RankingsSectionHeader from "@/components/RankingsSectionHeader";
import TopRappersGrid from "@/components/TopRappersGrid";
import StatsOverview from "@/components/StatsOverview";
import AnalyticsButton from "@/components/AnalyticsButton";
import GuestCallToAction from "@/components/GuestCallToAction";
import AdUnit from "@/components/AdUnit";
import OfficialRankingsSection from "@/components/rankings/OfficialRankingsSection";

const Index = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch the top 3 most active official rankings to replace the fixed sections
  const { data: topActiveRankings = [], isLoading } = useQuery({
    queryKey: ["top-active-rankings-for-sections"],
    queryFn: async () => {
      // Get the top 3 most active official rankings
      const { data: rankingsData, error: rankingsError } = await supabase
        .from("official_rankings")
        .select("*")
        .order("activity_score", { ascending: false })
        .order("last_activity_at", { ascending: false })
        .limit(3);

      if (rankingsError) throw rankingsError;

      // Fetch top 5 ranked items for each ranking
      const rankingsWithItems = await Promise.all(
        (rankingsData || []).map(async (ranking) => {
          const { data: itemsData, error: itemsError } = await supabase
            .from("ranking_items")
            .select(`
              *,
              rapper:rappers(*)
            `)
            .eq("ranking_id", ranking.id)
            .eq("is_ranked", true)
            .order("position")
            .limit(5);

          if (itemsError) {
            console.error(`Error fetching items for ranking ${ranking.id}:`, itemsError);
            return { ...ranking, items: [], rappers: [] };
          }

          const rappers = (itemsData || []).map(item => item.rapper).filter(Boolean);
          return { 
            ...ranking, 
            items: itemsData || [],
            rappers: rappers
          };
        })
      );

      return rankingsWithItems;
    }
  });

  // Fetch the most active official rankings for the dedicated section
  const { data: activeRankings = [] } = useQuery({
    queryKey: ["active-official-rankings"],
    queryFn: async () => {
      // Get the top 3 most active official rankings
      const { data: rankingsData, error: rankingsError } = await supabase
        .from("official_rankings")
        .select("*")
        .order("activity_score", { ascending: false })
        .order("last_activity_at", { ascending: false })
        .limit(3);

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
            .eq("is_ranked", true)
            .order("position")
            .limit(5);

          if (itemsError) {
            console.error(`Error fetching items for ranking ${ranking.id}:`, itemsError);
            return { ...ranking, items: [] };
          }

          return { ...ranking, items: itemsData || [] };
        })
      );

      // Transform to match component props
      return rankingsWithItems.map((ranking) => ({
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
        likes: ranking.activity_score || 0,
        views: Math.floor((ranking.activity_score || 0) * 2.5) + 500,
        isOfficial: true,
        tags: ["Official", ranking.category],
        slug: ranking.slug,
      }));
    }
  });

  const handleRankingClick = (id: string) => {
    console.log('Ranking clicked:', id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon overflow-x-hidden">
      {/* Sticky Header */}
      <HeaderNavigation isScrolled={isScrolled} />

      {/* Main Content with increased top padding to account for fixed header */}
      <main className="pt-20 sm:pt-24 w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Hero Section */}
          <HeroSection />

          {/* Ad placement after hero */}
          <AdUnit placement="hero-bottom" pageRoute="/" />

          {/* Featured Blog Posts Carousel */}
          <BlogCarousel />

          {/* Ad placement between sections */}
          <AdUnit placement="between-sections" pageRoute="/" />

          {/* Rankings Section with Prominent Header */}
          <RankingsSectionHeader />

          {/* Dynamic Ranking Sections - Replace fixed sections with most active rankings */}
          {!isLoading && topActiveRankings.length > 0 && (
            <>
              {topActiveRankings.map((ranking, index) => (
                <TopRappersGrid 
                  key={ranking.id}
                  title={ranking.title}
                  description={ranking.description}
                  rappers={ranking.rappers}
                  showViewAll={true}
                  viewAllLink={`/rankings/official/${ranking.slug}`}
                />
              ))}
            </>
          )}

          {/* Most Active Official Rankings */}
          {activeRankings.length > 0 && (
            <OfficialRankingsSection 
              rankings={activeRankings}
              onRankingClick={handleRankingClick}
            />
          )}

          {/* Stats Overview */}
          <StatsOverview />
          
          {/* View All Stats Button */}
          <AnalyticsButton />

          {/* Guest user call-to-action */}
          <GuestCallToAction />
        </div>
      </main>
    </div>
  );
};

export default Index;
