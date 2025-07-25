import { useState, useEffect } from "react";
import { useOptimizedQuery } from "@/hooks/useOptimizedQuery";
import { supabase } from "@/integrations/supabase/client";
import { useAdaptivePolling } from "@/hooks/useAdaptivePolling";
import HeaderNavigation from "@/components/HeaderNavigation";
import HeroSection from "@/components/HeroSection";
import BlogCarousel from "@/components/BlogCarousel";
import RankingsSectionHeader from "@/components/RankingsSectionHeader";
import TopRappersGrid from "@/components/TopRappersGrid";
import StatsOverview from "@/components/StatsOverview";
import AnalyticsButton from "@/components/AnalyticsButton";
import GuestCallToAction from "@/components/GuestCallToAction";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";

const Index = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { refetchInterval, refetchIntervalInBackground } = useAdaptivePolling({
    baseInterval: 15000,
    maxInterval: 120000,
    enabled: true
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch the top 3 official rankings ordered by display_order
  const { data: topActiveRankings = [], isLoading } = useOptimizedQuery({
    queryKey: ["homepage-rankings-by-display-order"],
    queryFn: async () => {
      // Get the official rankings in display order
      const { data: rankingsData, error: rankingsError } = await supabase
        .from("official_rankings")
        .select("*")
        .order("display_order", { ascending: true })
        .limit(3);

      if (rankingsError) throw rankingsError;

      // For each ranking, get rappers with real-time vote counts
      const rankingsWithItems = await Promise.all(
        (rankingsData || []).map(async (ranking) => {
          // Get all ranking items for this ranking
          const { data: itemsData, error: itemsError } = await supabase
            .from("ranking_items")
            .select(`
              *,
              rapper:rappers(*)
            `)
            .eq("ranking_id", ranking.id);

          if (itemsError) {
            return { ...ranking, items: [], rappers: [] };
          }

          // Get weighted vote counts for this specific ranking
          const { data: voteData, error: voteError } = await supabase
            .from("ranking_votes")
            .select("rapper_id, vote_weight")
            .eq("ranking_id", ranking.id);

          if (voteError) {
            return { ...ranking, items: itemsData || [], rappers: [] };
          }

          // Aggregate vote counts by rapper
          const voteCounts: Record<string, number> = {};
          voteData.forEach(vote => {
            voteCounts[vote.rapper_id] = (voteCounts[vote.rapper_id] || 0) + vote.vote_weight;
          });

          // Enhance rappers with ranking-specific vote counts and sort by votes
          const rappersWithVotes = (itemsData || [])
            .map(item => ({
              ...item.rapper,
              ranking_votes: voteCounts[item.rapper?.id] || 0
            }))
            .filter(rapper => rapper.id)
            .sort((a, b) => (b.ranking_votes || 0) - (a.ranking_votes || 0))
            .slice(0, 5); // Top 5 for homepage display

          return { 
            ...ranking, 
            items: itemsData || [],
            rappers: rappersWithVotes
          };
        })
      );

      return rankingsWithItems;
    },
    refetchInterval,
    refetchIntervalInBackground,
    priority: 'high',
    enableBackground: true,
  });

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon overflow-x-hidden">
        {/* Sticky Header */}
        <HeaderNavigation isScrolled={isScrolled} />

        {/* Main Content with increased top padding to account for fixed header */}
        <main className="pt-20 sm:pt-24 w-full overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            {/* Hero Section */}
            <HeroSection />

            {/* Featured Blog Posts Carousel */}
            <BlogCarousel />

            {/* Rankings Section with Prominent Header */}
            <RankingsSectionHeader />

            {/* Dynamic Ranking Sections with real-time vote data */}
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
                    rankingId={ranking.id}
                  />
                ))}
              </>
            )}

            {/* All Rankings Button */}
            <div className="mb-12 text-center">
              <Link to="/rankings" className="w-full sm:w-auto" onClick={() => window.scrollTo(0, 0)}>
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto border-rap-gold/30 text-rap-gold hover:bg-rap-gold hover:text-rap-charcoal font-mogra text-sm px-6 py-3"
                >
                  All Rankings
                </Button>
              </Link>
            </div>

            {/* Stats Overview */}
            <StatsOverview />
            
            {/* View All Stats Button */}
            <AnalyticsButton />

            {/* Guest user call-to-action */}
            <GuestCallToAction />
          </div>
        </main>

        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default Index;
