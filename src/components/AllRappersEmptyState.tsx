
import React from "react";
import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
import { Music } from "lucide-react";

const AllRappersEmptyState = () => {
  return (
    <ThemedCard>
      <ThemedCardContent className="p-8 text-center">
        <Music className="w-16 h-16 text-[var(--theme-accent)] mx-auto mb-4" />
        <h3 className="text-xl font-bold text-[var(--theme-text)] mb-2">No Rappers Found</h3>
        <p className="text-[var(--theme-textMuted)]">Try adjusting your search or filter criteria.</p>
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default AllRappersEmptyState;
