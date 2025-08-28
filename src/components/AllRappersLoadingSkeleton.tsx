
import React from "react";
import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";

const AllRappersLoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <ThemedCard key={i} className="animate-pulse relative overflow-hidden">
          {/* Theme accent bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-[var(--theme-primary)]"></div>
          
          <ThemedCardContent className="p-6">
            {/* Image skeleton - aspect-square to match RapperCard */}
            <div className="w-full aspect-square bg-[var(--theme-surface)]/60 rounded-lg mb-4"></div>
            
            {/* Name skeleton */}
            <div className="h-5 bg-[var(--theme-surface)]/60 rounded mb-3 w-3/4"></div>
            
            {/* Real name skeleton */}
            <div className="h-4 bg-[var(--theme-surface)]/40 rounded mb-3 w-1/2"></div>
            
            {/* Origin/Birthdate badges skeleton */}
            <div className="flex gap-2 mb-3">
              <div className="h-6 bg-[var(--theme-surface)]/40 rounded-full w-16"></div>
              <div className="h-6 bg-[var(--theme-surface)]/40 rounded-full w-12"></div>
            </div>
            
            {/* Three-column stats grid skeleton - matches RapperCard exactly */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[var(--theme-primary)]/20 px-2 py-2 rounded-lg border border-[var(--theme-border)] h-14">
                <div className="h-4 bg-[var(--theme-surface)]/60 rounded mb-1 w-8 mx-auto"></div>
                <div className="h-3 bg-[var(--theme-surface)]/40 rounded w-12 mx-auto"></div>
              </div>
              <div className="bg-[var(--theme-accent)]/20 px-2 py-2 rounded-lg border border-[var(--theme-border)] h-14">
                <div className="h-4 bg-[var(--theme-surface)]/60 rounded mb-1 w-8 mx-auto"></div>
                <div className="h-3 bg-[var(--theme-surface)]/40 rounded w-10 mx-auto"></div>
              </div>
              <div className="bg-[var(--theme-secondary)]/20 px-2 py-2 rounded-lg border border-[var(--theme-border)] h-14">
                <div className="h-4 bg-[var(--theme-surface)]/60 rounded mb-1 w-8 mx-auto"></div>
                <div className="h-3 bg-[var(--theme-surface)]/40 rounded w-8 mx-auto"></div>
              </div>
            </div>
          </ThemedCardContent>
        </ThemedCard>
      ))}
    </div>
  );
};

export default AllRappersLoadingSkeleton;
