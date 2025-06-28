
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { RankingItemWithDelta } from "@/hooks/useRankingData";
import RankingItemPositionCap from "./RankingItemPositionCap";
import RankingItemContent from "./RankingItemContent";
import RankingItemVoteSection from "./RankingItemVoteSection";

interface RankingItemCardProps {
  item: RankingItemWithDelta;
  onVote: (rapperName: string) => void;
  userLoggedIn: boolean;
  hotThreshold: number;
  rankingId?: string;
  rapperImageUrl?: string;
}

const RankingItemCard = ({
  item,
  onVote,
  userLoggedIn,
  hotThreshold,
  rankingId,
  rapperImageUrl
}: RankingItemCardProps) => {
  const isMobile = useIsMobile();
  const isHot = item.ranking_votes >= hotThreshold;
  const voteVelocity = isHot ? Math.floor(Math.random() * 15) + 5 : 0;
  const isPending = (item as any).isPending || false;
  const isTopFive = item.dynamic_position <= 5;

  const getCardStyling = () => {
    if (isTopFive) {
      return "bg-rap-carbon/40 border-rap-gold/30 shadow-lg hover:bg-rap-carbon/60 hover:shadow-xl hover:border-rap-gold/50";
    }
    return "bg-rap-carbon/20 border-rap-platinum/20 hover:bg-rap-carbon/30 hover:border-rap-platinum/30";
  };

  const getCardHeight = () => {
    if (isTopFive) {
      return "min-h-[120px] sm:min-h-[140px]";
    }
    return "min-h-[32px] sm:min-h-[40px]";
  };

  const getMobileLayout = () => {
    if (isTopFive) {
      return "flex-col items-center text-center sm:flex-row sm:items-start sm:text-left";
    }
    return "flex-row items-center";
  };

  const getContentSpacing = () => {
    if (isTopFive) {
      return "gap-4 p-4 sm:gap-6 sm:p-6";
    }
    return "gap-1 p-1 sm:gap-2 sm:p-2";
  };

  return (
    <div className={`flex ${getMobileLayout()} ${getContentSpacing()} ${getCardHeight()} ${isMobile ? 'rounded-b-lg' : 'rounded-r-lg'} border transition-all duration-300 relative ${getCardStyling()} ${
      isPending ? 'ring-2 ring-yellow-500/50 bg-yellow-500/10' : ''
    } overflow-hidden`}>
      {/* Position Cap */}
      <RankingItemPositionCap position={item.dynamic_position} isTopFive={isTopFive} />
      
      {/* Content */}
      <RankingItemContent
        item={item}
        isTopFive={isTopFive}
        isHot={isHot}
        voteVelocity={voteVelocity}
        rapperImageUrl={rapperImageUrl}
        isPending={isPending}
      />
      
      {/* Vote Section */}
      <RankingItemVoteSection
        onVote={onVote}
        userLoggedIn={userLoggedIn}
        isTopFive={isTopFive}
        rankingId={rankingId}
        rapperId={item.rapper?.id}
        rapperName={item.rapper?.name}
        isPending={isPending}
      />
      
      {/* Pending Indicator */}
      {isPending && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default RankingItemCard;
