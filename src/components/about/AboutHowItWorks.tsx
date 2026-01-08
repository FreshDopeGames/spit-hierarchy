import React from "react";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";

const AboutHowItWorks = () => {
  return (
    <ThemedCard variant="dark">
      <ThemedCardHeader>
        <ThemedCardTitle className="text-2xl sm:text-4xl font-normal whitespace-nowrap">
          How It Works
        </ThemedCardTitle>
      </ThemedCardHeader>
      <ThemedCardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primaryLight)] rounded-full w-8 h-8 flex items-center justify-center text-[var(--theme-background)] font-[var(--theme-font-heading)] shadow-lg px-[15px]">1</div>
            <div>
              <h3 className="font-[var(--theme-font-heading)] text-[var(--theme-textLight)]">Browse Artists</h3>
              <p className="text-[var(--theme-text)] font-[var(--theme-font-body)]">Explore our comprehensive database of rappers from all eras and regions.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primaryLight)] rounded-full w-8 h-8 flex items-center justify-center text-[var(--theme-background)] font-[var(--theme-font-heading)] shadow-lg px-[15px]">2</div>
            <div>
              <h3 className="font-[var(--theme-font-heading)] text-[var(--theme-textLight)]">Cast Your Vote</h3>
              <p className="text-[var(--theme-text)] font-[var(--theme-font-body)]">Rate artists based on skills, impact, and your personal preference.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primaryLight)] rounded-full w-8 h-8 flex items-center justify-center text-[var(--theme-background)] font-[var(--theme-font-heading)] shadow-lg px-[15px]">3</div>
            <div>
              <h3 className="font-[var(--theme-font-heading)] text-[var(--theme-textLight)]">Watch Rankings</h3>
              <p className="text-[var(--theme-text)] font-[var(--theme-font-body)]">See how your votes contribute to the live, community-driven rankings.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primaryLight)] rounded-full w-8 h-8 flex items-center justify-center text-[var(--theme-background)] font-[var(--theme-font-heading)] shadow-lg px-[15px]">4</div>
            <div>
              <h3 className="font-[var(--theme-font-heading)] text-[var(--theme-textLight)]">Join the Debate</h3>
              <p className="text-[var(--theme-text)] font-[var(--theme-font-body)]">Engage with the community and defend your favorite artists.</p>
            </div>
          </div>
        </div>
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default AboutHowItWorks;