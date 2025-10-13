
import React from "react";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import { Trophy, Users, BarChart3, Vote } from "lucide-react";
const AboutFeatures = () => {
  return <div className="grid md:grid-cols-2 gap-6">
      <ThemedCard variant="dark" className="shadow-lg border-2">
        <ThemedCardHeader>
          <ThemedCardTitle className="flex items-center font-normal text-4xl">
            <Vote className="w-5 h-5 mr-3 text-[var(--theme-secondary)]" />
            Vote & Rank
          </ThemedCardTitle>
        </ThemedCardHeader>
        <ThemedCardContent>
          <p className="text-[var(--theme-text)] font-[var(--theme-font-body)]">
            Cast your vote for your favorite MCs across different categories. 
            Rate their lyrical ability, flow, impact, and overall contribution to the culture.
          </p>
        </ThemedCardContent>
      </ThemedCard>

      <ThemedCard variant="dark" className="shadow-lg border-2">
        <ThemedCardHeader>
          <ThemedCardTitle className="flex items-center font-normal text-4xl">
            <Trophy className="w-5 h-5 mr-3 text-[var(--theme-accent)]" />
            Real Rankings
          </ThemedCardTitle>
        </ThemedCardHeader>
        <ThemedCardContent>
          <p className="text-[var(--theme-text)] font-[var(--theme-font-body)]">
            See live rankings that change based on community votes. 
            Watch as new artists climb the charts and legends defend their positions.
          </p>
        </ThemedCardContent>
      </ThemedCard>

      <ThemedCard variant="dark" className="shadow-lg border-2">
        <ThemedCardHeader>
          <ThemedCardTitle className="flex items-center font-thin text-4xl">
            <Users className="w-5 h-5 mr-3 text-[var(--theme-primary)]" />
            Community Driven
          </ThemedCardTitle>
        </ThemedCardHeader>
        <ThemedCardContent>
          <p className="text-[var(--theme-text)] font-[var(--theme-font-body)]">
            Join a community of true hip-hop heads. Share your opinions, 
            debate the rankings, and connect with fans who share your passion.
          </p>
        </ThemedCardContent>
      </ThemedCard>

      <ThemedCard variant="dark" className="shadow-lg border-2">
        <ThemedCardHeader>
          <ThemedCardTitle className="flex items-center font-normal text-4xl">
            <BarChart3 className="w-5 h-5 mr-3 text-[var(--theme-textMuted)]" />
            Deep Analytics
          </ThemedCardTitle>
        </ThemedCardHeader>
        <ThemedCardContent>
          <p className="text-[var(--theme-text)] font-[var(--theme-font-body)]">
            Dive deep into the data with comprehensive analytics. 
            Track voting trends, see regional preferences, and discover emerging artists.
          </p>
        </ThemedCardContent>
      </ThemedCard>
    </div>;
};
export default AboutFeatures;
