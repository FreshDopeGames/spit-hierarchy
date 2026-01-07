
import React, { useState, useEffect } from "react";
import HeaderNavigation from "@/components/HeaderNavigation";
import Footer from "@/components/Footer";
import AboutHero from "@/components/about/AboutHero";
import AboutWhatWeDo from "@/components/about/AboutWhatWeDo";
import AboutFeatures from "@/components/about/AboutFeatures";
import AboutHowItWorks from "@/components/about/AboutHowItWorks";
import AboutMemberLevels from "@/components/about/AboutMemberLevels";
import AboutCreator from "@/components/about/AboutCreator";
import AboutCallToAction from "@/components/about/AboutCallToAction";
import { usePageVisitTracking } from "@/hooks/usePageVisitTracking";
import SEOHead from "@/components/seo/SEOHead";

const About = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Track page visit for achievements
  usePageVisitTracking('about_visits');

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--theme-element-page-background-bg,var(--theme-background))] relative">
      <SEOHead
        title="About Spit Hierarchy - The Ultimate Hip-Hop Ranking Platform"
        description="Discover the story behind Spit Hierarchy, the community-driven platform where hip-hop fans vote, rank, and celebrate the greatest rappers of all time. Join our vibrant community today."
        keywords={['about us', 'hip hop community', 'rap culture', 'music platform', 'rapper rankings', 'hip hop voting']}
        canonicalUrl="/about"
      />
      {/* Background overlay for future custom backgrounds */}
      <div className="absolute inset-0 bg-[var(--theme-element-page-background-bg,var(--theme-background))] opacity-90 z-0"></div>
      
      <div className="relative z-10">
        <HeaderNavigation isScrolled={isScrolled} />
        
        <div className="pt-20 max-w-4xl mx-auto p-6 space-y-8 pb-5">
          <AboutHero />
          <AboutWhatWeDo />
          <AboutFeatures />
          <AboutHowItWorks />
          <AboutMemberLevels />
          <AboutCreator />
          <AboutCallToAction />
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default About;
