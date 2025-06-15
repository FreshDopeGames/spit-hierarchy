
import React, { useState, useEffect } from "react";
import HeaderNavigation from "@/components/HeaderNavigation";
import Footer from "@/components/Footer";
import AboutHero from "@/components/about/AboutHero";
import AboutWhatWeDo from "@/components/about/AboutWhatWeDo";
import AboutFeatures from "@/components/about/AboutFeatures";
import AboutHowItWorks from "@/components/about/AboutHowItWorks";
import AboutCallToAction from "@/components/about/AboutCallToAction";

const About = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon relative">
      {/* Background overlay for future custom backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-br from-rap-carbon/80 via-rap-carbon-light/80 to-rap-carbon/80 z-0"></div>
      
      <div className="relative z-10">
        <HeaderNavigation isScrolled={isScrolled} />
        
        <div className="pt-24 max-w-4xl mx-auto p-6 space-y-8">
          <AboutHero />
          <AboutWhatWeDo />
          <AboutFeatures />
          <AboutHowItWorks />
          <AboutCallToAction />
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default About;
