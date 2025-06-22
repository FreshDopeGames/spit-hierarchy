
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface RankingLoadMoreProps {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  totalItems: number;
  displayCount: number;
}

const RankingLoadMore = ({ 
  hasMore, 
  loading, 
  onLoadMore, 
  totalItems, 
  displayCount 
}: RankingLoadMoreProps) => {
  if (!hasMore) return null;

  return (
    <div className="text-center mt-6">
      <Button
        onClick={onLoadMore}
        disabled={loading}
        variant="outline"
        className="border-rap-gold/30 text-rap-gold hover:bg-rap-gold hover:text-rap-carbon"
      >
        <ChevronDown className="w-4 h-4 mr-2" />
        {loading ? "Loading..." : `Load More (${totalItems - displayCount} remaining)`}
      </Button>
    </div>
  );
};

export default RankingLoadMore;
