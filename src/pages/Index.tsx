import { useState, useEffect } from "react";
import HeaderNavigation from "@/components/HeaderNavigation";
import BlogCarousel from "@/components/BlogCarousel";
import HomepagePoll from "@/components/polls/HomepagePoll";
import RankingsSectionHeader from "@/components/RankingsSectionHeader";
import HomepageRankingSection from "@/components/HomepageRankingSection";
import StatsOverview from "@/components/StatsOverviewRedesigned";
import GuestCallToAction from "@/components/GuestCallToAction";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import SEOHead from "@/components/seo/SEOHead";
import ContentAdUnit from "@/components/ads/ContentAdUnit";

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
    </ErrorBoundary>
  );
};

export default Index;
