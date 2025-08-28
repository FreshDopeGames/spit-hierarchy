
import React from "react";
import { ThemedButton } from "@/components/ui/themed-button";
import { Loader2 } from "lucide-react";

interface LoadMoreButtonProps {
  hasMore: boolean;
  isFetching: boolean;
  onLoadMore: () => void;
  total: number;
  currentCount: number;
}

const LoadMoreButton = ({
  hasMore,
  isFetching,
  onLoadMore,
  total,
  currentCount
}: LoadMoreButtonProps) => {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center" id="load-more-anchor">
      <ThemedButton
        onClick={onLoadMore}
        disabled={isFetching}
        variant="default"
        size="lg"
        className="px-8 py-3 text-lg border-2 border-[var(--theme-border)] shadow-lg transition-all duration-300"
      >
        {isFetching ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            <span className="font-[var(--theme-font-body)]">Loading More...</span>
          </>
        ) : (
          <span className="font-[var(--theme-font-body)]">Load More Artists ({total - currentCount} remaining)</span>
        )}
      </ThemedButton>
    </div>
  );
};

export default LoadMoreButton;
