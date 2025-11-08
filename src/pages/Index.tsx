import { useState, useEffect } from "react";
import { useOptimizedQuery } from "@/hooks/useOptimizedQuery";
import { supabase } from "@/integrations/supabase/client";
import { useAdaptivePolling } from "@/hooks/useAdaptivePolling";
import HeaderNavigation from "@/components/HeaderNavigation";
import BlogCarousel from "@/components/BlogCarousel";
import HomepagePoll from "@/components/polls/HomepagePoll";
import RankingsSectionHeader from "@/components/RankingsSectionHeader";
import HomepageRankingSection from "@/components/HomepageRankingSection";
import StatsOverview from "@/components/StatsOverviewRedesigned";
import GuestCallToAction from "@/components/GuestCallToAction";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import SEOHead from "@/components/seo/SEOHead";
import ContentAdUnit from "@/components/ads/ContentAdUnit";
const Index = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const {
    refetchInterval,
    refetchIntervalInBackground
  } = useAdaptivePolling({
    baseInterval: 15000,
    maxInterval: 120000,
    enabled: true
  });
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };
    window.addEventListener("scroll", handleScroll, {
      passive: true
    });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch the top 3 official rankings ordered by display_order
  const {
    data: topActiveRankings = [],
    isLoading
  } = useOptimizedQuery({
    queryKey: ["homepage-rankings-by-display-order"],
    queryFn: async () => {
      // Get the official rankings in display order
      const {
        data: rankingsData,
        error: rankingsError
      } = await supabase.from("official_rankings").select("*").order("display_order", {
        ascending: true
      }).limit(3);
      if (rankingsError) throw rankingsError;

      // For each ranking, get rappers with real-time vote counts
      const rankingsWithItems = await Promise.all((rankingsData || []).map(async ranking => {
        // Get all ranking items for this ranking
        const {
          data: itemsData,
          error: itemsError
        } = await supabase.from("ranking_items").select(`
              *,
              rapper:rappers(*)
            `).eq("ranking_id", ranking.id);
        if (itemsError) {
          return {
            ...ranking,
            items: [],
            rappers: []
          };
        }

        // Get weighted vote counts for this specific ranking
        const {
          data: voteData,
          error: voteError
        } = await supabase.from("ranking_votes").select("rapper_id, vote_weight").eq("ranking_id", ranking.id);
        if (voteError) {
          return {
            ...ranking,
            items: itemsData || [],
            rappers: []
          };
        }

        // Aggregate vote counts by rapper
        const voteCounts: Record<string, number> = {};
        voteData.forEach(vote => {
          voteCounts[vote.rapper_id] = (voteCounts[vote.rapper_id] || 0) + vote.vote_weight;
        });

        // Order by official ranking position and enhance with vote counts
        const rappersWithVotes = (itemsData || []).sort((a, b) => (a.position ?? 0) - (b.position ?? 0)).slice(0, 5).map(item => ({
          ...item.rapper,
          ranking_votes: voteCounts[item.rapper?.id] || 0
        })).filter(rapper => rapper && rapper.id);
        return {
          ...ranking,
          items: itemsData || [],
          rappers: rappersWithVotes
        };
      }));
      return rankingsWithItems;
    },
    refetchInterval,
    refetchIntervalInBackground,
    priority: "high",
    enableBackground: true
  });
  return <ErrorBoundary>
      <SEOHead title="Spit Hierarchy - The Ultimate Rap Rankings Platform" description="Join the ultimate rapper ranking platform. Vote on your favorite rappers, discover new artists, and explore the best in hip-hop culture. Community-driven rankings with real-time voting." keywords={["rap rankings", "hip hop voting", "rapper polls", "music community", "hip hop culture", "rap battles"]} />
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon overflow-x-hidden">
        {/* Sticky Header */}
        <HeaderNavigation isScrolled={isScrolled} />

        {/* Main Content with increased top padding to account for fixed header */}
        <main className="pt-20 sm:pt-24 w-full overflow-x-hidden pb-5">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            {/* Rankings Section with Prominent Header */}
            <RankingsSectionHeader />

            {/* Featured Rankings Section */}
            <HomepageRankingSection />

            {/* Featured Blog Posts Carousel */}
            <BlogCarousel />

            {/* Strategic Ad Placement */}
            <ContentAdUnit size="large" />

            {/* Stats Overview (includes Analytics Button) */}
            <StatsOverview />

            {/* Community Polls */}
            <HomepagePoll />

            {/* Ad after polls */}
            <ContentAdUnit size="medium" />

            {/* Guest user call-to-action */}
            <GuestCallToAction />
          </div>
        </main>

        <Footer />
      </div>
    </ErrorBoundary>;
};
export default Index;