
import React from "react";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import { User } from "lucide-react";
import creatorImage from "@/assets/creator-craig-tinsley.jpg";

const AboutCreator = () => {
  return (
    <ThemedCard variant="dark">
      <ThemedCardHeader>
        <ThemedCardTitle className="text-2xl sm:text-4xl font-normal flex items-center gap-3 whitespace-nowrap">
          <User className="w-6 h-6 text-[hsl(var(--theme-primary))]" />
          The Creator
        </ThemedCardTitle>
      </ThemedCardHeader>
      <ThemedCardContent>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={creatorImage}
            alt="Craig Tinsley (S2BKAS)"
            className="w-48 h-48 sm:w-56 sm:h-56 object-cover rounded-lg border-2 border-[hsl(var(--theme-primary))]/30 shadow-lg shadow-[hsl(var(--theme-primary))]/20 flex-shrink-0"
          />
          <div className="text-center sm:text-left">
            <h3 className="font-[var(--theme-font-heading)] text-[hsl(var(--theme-textLight))] text-xl mb-3">
              Craig Tinsley (aka S2BKAS)
            </h3>
            <p className="text-[hsl(var(--theme-text))] font-[var(--theme-font-body)]">
              Craig Tinsley (aka S2BKAS) is an educator, designer, and lyricist from Los Angeles with a passion for expanding the footprint of The Art of Rap further into the digital space and deeper into our social fabric. Spit Hierarchy is a labor of love first and foremost, and strives to give Rap and Hip-Hop fans a place to let their voices be heard.
            </p>
          </div>
        </div>
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default AboutCreator;
