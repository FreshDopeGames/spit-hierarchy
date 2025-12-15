import { useState, useEffect, lazy, Suspense } from "react";
import HeaderNavigation from "@/components/HeaderNavigation";
import BlogCarousel from "@/components/BlogCarousel";
import RankingsSectionHeader from "@/components/RankingsSectionHeader";
import HomepageRankingSection from "@/components/HomepageRankingSection";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import SEOHead from "@/components/seo/SEOHead";
import ContentAdUnit from "@/components/ads/ContentAdUnit";
import LazySection from "@/components/LazySection";

// Lazy load below-fold components for faster initial render
const HomepagePoll = lazy(() => import("@/components/polls/HomepagePoll"));
const StatsOverview = lazy(() => import("@/components/StatsOverviewRedesigned"));
const GuestCallToAction = lazy(() => import("@/components/GuestCallToAction"));

// Minimal loading placeholder for lazy sections
const SectionPlaceholder = () => (
  <div className="min-h-[200px] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[hsl(var(--theme-primary))] border-t-transparent rounded-full animate-spin" />
  </div>
);

const Index = () => {
  const [isScrolled, setIsScrolled] = useState(false);

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

  return (
    <ErrorBoundary>
      <SEOHead 
        title="Spit Hierarchy - The Ultimate Rap Rankings Platform" 
        description="Join the ultimate rapper ranking platform. Vote on your favorite rappers, discover new artists, and explore the best in hip-hop culture. Community-driven rankings with real-time voting." 
        keywords={["rap rankings", "hip hop voting", "rapper polls", "music community", "hip hop culture", "rap battles"]} 
      />
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

            {/* Lazy-loaded Stats Overview (below fold) */}
            <LazySection fallback={<SectionPlaceholder />}>
              <Suspense fallback={<SectionPlaceholder />}>
                <StatsOverview />
              </Suspense>
            </LazySection>

            {/* Lazy-loaded Community Polls (below fold) */}
            <LazySection fallback={<SectionPlaceholder />}>
              <Suspense fallback={<SectionPlaceholder />}>
                <HomepagePoll />
              </Suspense>
            </LazySection>

            {/* Ad after polls */}
            <ContentAdUnit size="medium" />

            {/* Lazy-loaded Guest user call-to-action (below fold) */}
            <LazySection fallback={<SectionPlaceholder />}>
              <Suspense fallback={<SectionPlaceholder />}>
                <GuestCallToAction />
              </Suspense>
            </LazySection>
          </div>
        </main>

        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default Index;
