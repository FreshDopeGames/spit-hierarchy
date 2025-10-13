import React from "react";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import { Music } from "lucide-react";

const AboutWhatWeDo = () => {
  return (
    <ThemedCard variant="dark">
      <ThemedCardHeader>
        <ThemedCardTitle className="flex items-center text-5xl font-normal">
          <Music className="w-6 h-6 mr-3 text-[var(--theme-primary)]" />
          What We Do
        </ThemedCardTitle>
      </ThemedCardHeader>
      <ThemedCardContent className="space-y-4">
        <p className="text-[var(--theme-text)] font-[var(--theme-font-body)]">
          Spit Hierarchy is a community-driven platform where hip-hop fans vote, rank, and debate 
          the greatest rappers of all time. We're not just another ranking site – we're the voice 
          of the culture, powered by real fans who live and breathe hip-hop.
        </p>
        <p className="text-[var(--theme-text)] font-[var(--theme-font-body)]">
          From underground legends to mainstream superstars, every MC gets their due respect. 
          Our rankings reflect what the streets are saying, what the clubs are playing, 
          and what the culture is feeling.
        </p>
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default AboutWhatWeDo;