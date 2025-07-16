
import React, { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { RankingItemWithDelta } from "@/hooks/useRankingData";
import { useRapperImages } from "@/hooks/useImageStyle";
import RankingItemCard from "./RankingItemCard";
import RankingLoadMore from "./RankingLoadMore";

interface OfficialRankingItemsProps {
  items: RankingItemWithDelta[];
  onVote: (rapperName: string) => void;
  userLoggedIn: boolean;
  hotThreshold: number;
  displayCount: number;
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  rankingId?: string;
}

const OfficialRankingItems = ({
  items,
  onVote,
  userLoggedIn,
  hotThreshold,
  displayCount,
  onLoadMore,
  hasMore,
  loading,
  rankingId
}: OfficialRankingItemsProps) => {
  const [searchKeyword, setSearchKeyword] = useState("");

  // Filter items based on search keyword
  const filteredItems = useMemo(() => {
    if (!searchKeyword.trim()) {
      return items;
    }
    
    return items.filter(item => 
      item.rapper?.name.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  }, [items, searchKeyword]);

  const displayedItems = filteredItems.slice(0, displayCount);

  // Batch load rapper images for performance - use medium size for ranking items
  const rapperIds = displayedItems.map(item => item.rapper?.id).filter(Boolean) as string[];
  const { data: rapperImages = {} } = useRapperImages(rapperIds, 'medium');

  const clearSearch = () => {
    setSearchKeyword("");
  };

  // Determine if we should show the load more button
  const showLoadMore = !searchKeyword.trim() && hasMore;

  return (
    <div className="space-y-4">
      {/* Keyword Filter */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-rap-smoke" />
          <input
            type="text"
            placeholder="Search rappers..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-rap-carbon/90 border-rap-forest/60 text-rap-platinum placeholder-rap-smoke focus:border-rap-burgundy focus:ring-rap-burgundy/30 focus:outline-none transition-all rounded-lg font-street !text-rap-platinum"
          />
          {searchKeyword && (
            <button
              onClick={clearSearch}
              className="absolute right-3 h-4 w-4 text-rap-smoke hover:text-rap-platinum transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {searchKeyword && (
          <div className="mt-2 text-sm text-rap-smoke">
            {filteredItems.length === 0 
              ? "No rappers found matching your search"
              : `Found ${filteredItems.length} rapper${filteredItems.length === 1 ? '' : 's'}`
            }
          </div>
        )}
      </div>

      {/* Ranking Items */}
      {displayedItems.map((item) => (
        <RankingItemCard
          key={item.id}
          item={item}
          onVote={onVote}
          userLoggedIn={userLoggedIn}
          hotThreshold={hotThreshold}
          rankingId={rankingId}
          rapperImageUrl={rapperImages[item.rapper?.id]}
        />
      ))}

      {/* Show message if no items to display */}
      {displayedItems.length === 0 && !loading && (
        <div className="text-center py-8 text-rap-smoke">
          {searchKeyword ? "No rappers found matching your search." : "No rappers to display."}
        </div>
      )}

      {/* Load More Button - only show when not searching */}
      {showLoadMore && (
        <RankingLoadMore
          hasMore={hasMore}
          loading={loading}
          onLoadMore={onLoadMore}
          totalItems={items.length}
          displayCount={displayCount}
        />
      )}
    </div>
  );
};

export default OfficialRankingItems;
