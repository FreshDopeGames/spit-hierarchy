
import { useState, useEffect } from "react";
import HeaderNavigation from "@/components/HeaderNavigation";
import HeroSection from "@/components/HeroSection";
import BlogCarousel from "@/components/BlogCarousel";
import RankingsSectionHeader from "@/components/RankingsSectionHeader";
import TopRappersGrid from "@/components/TopRappersGrid";
import RisingLegendsSection from "@/components/RisingLegendsSection";
import LyricalMastersSection from "@/components/LyricalMastersSection";
import StatsOverview from "@/components/StatsOverview";
import AnalyticsButton from "@/components/AnalyticsButton";
import GuestCallToAction from "@/components/GuestCallToAction";
import AdUnit from "@/components/AdUnit";

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

          {/* Top 5 Rappers Grid */}
          <TopRappersGrid />

          {/* Rising Legends Section */}
          <RisingLegendsSection />

          {/* Lyrical Masters Section */}
          <LyricalMastersSection />

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
