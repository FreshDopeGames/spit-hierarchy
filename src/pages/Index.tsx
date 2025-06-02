
import { useState, useEffect } from "react";
import HeaderNavigation from "@/components/HeaderNavigation";
import HeroSection from "@/components/HeroSection";
import BlogCarousel from "@/components/BlogCarousel";
import TopRappersGrid from "@/components/TopRappersGrid";
import RisingLegendsSection from "@/components/RisingLegendsSection";
import LyricalMastersSection from "@/components/LyricalMastersSection";
import StatsOverview from "@/components/StatsOverview";
import AnalyticsButton from "@/components/AnalyticsButton";
import GuestCallToAction from "@/components/GuestCallToAction";

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
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      {/* Sticky Header */}
      <HeaderNavigation isScrolled={isScrolled} />

      {/* Main Content with increased top padding to account for fixed header */}
      <main className="pt-24 max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <HeroSection />

        {/* Featured Blog Posts Carousel */}
        <BlogCarousel />

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
      </main>
    </div>
  );
};

export default Index;
