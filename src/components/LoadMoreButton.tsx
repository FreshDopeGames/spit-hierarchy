
import React from "react";
import { Button } from "@/components/ui/button";
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
      <Button
        onClick={onLoadMore}
        disabled={isFetching}
        className="bg-rap-gold hover:bg-rap-gold-light text-rap-carbon font-bold px-8 py-3 text-lg border-2 border-rap-silver/50 hover:border-rap-silver shadow-lg hover:shadow-rap-gold/30 transition-all duration-300 font-mogra"
      >
        {isFetching ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            <span className="font-kaushan">Loading More...</span>
          </>
        ) : (
          <span className="font-kaushan">Load More Artists ({total - currentCount} remaining)</span>
        )}
      </Button>
    </div>
  );
};

export default LoadMoreButton;
