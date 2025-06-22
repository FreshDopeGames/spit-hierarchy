
import React from "react";
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
  const displayedItems = items.slice(0, displayCount);

  // Batch load rapper images for performance
  const rapperIds = displayedItems.map(item => item.rapper?.id).filter(Boolean) as string[];
  const { data: rapperImages = {} } = useRapperImages(rapperIds);

  return (
    <div className="space-y-4">
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

      <RankingLoadMore
        hasMore={hasMore}
        loading={loading}
        onLoadMore={onLoadMore}
        totalItems={items.length}
        displayCount={displayCount}
      />
    </div>
  );
};

export default OfficialRankingItems;
