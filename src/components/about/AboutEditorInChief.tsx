import React from "react";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import { User } from "lucide-react";

const AboutEditorInChief = () => {
  return (
    <ThemedCard variant="dark">
      <ThemedCardHeader>
        <ThemedCardTitle className="text-2xl sm:text-4xl font-normal flex items-center gap-3 whitespace-nowrap">
          <User className="w-6 h-6 text-[hsl(var(--theme-primary))]" />
          Editor-In-Chief
        </ThemedCardTitle>
      </ThemedCardHeader>
      <ThemedCardContent>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg border-2 border-[hsl(var(--theme-primary))]/30 shadow-lg shadow-[hsl(var(--theme-primary))]/20 flex-shrink-0 bg-[hsl(var(--theme-surface))] flex items-center justify-center">
            <User className="w-16 h-16 text-[hsl(var(--theme-primary))]/40" />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="font-[var(--theme-font-heading)] text-[hsl(var(--theme-textLight))] text-xl mb-3">
              Ural Garrett
            </h3>
            <p className="text-[hsl(var(--theme-text))] font-[var(--theme-font-body)] italic">
              Bio coming soon.
            </p>
          </div>
        </div>
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default AboutEditorInChief;
