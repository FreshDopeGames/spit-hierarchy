
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

  const getCardDimensions = () => {
    if (isTopFive) {
      return "aspect-[4/3] md:aspect-square";
    }
    return "aspect-[3/1] md:aspect-[5/2]";
  };

  const getCardHeight = () => {
    if (isTopFive) {
      return "h-64 md:h-80 lg:h-96";
    }
    return "h-32 md:h-40";
  };

  const getCardStyling = () => {
    const baseStyle = "rounded-xl overflow-hidden border-2 transition-all duration-500 group cursor-pointer transform hover:scale-[1.02] hover:shadow-2xl";
    if (isTopFive) {
      return `${baseStyle} border-rap-gold/40 shadow-xl hover:border-rap-gold/60 hover:shadow-rap-gold/20`;
    }
    return `${baseStyle} border-rap-platinum/30 shadow-lg hover:border-rap-platinum/50 hover:shadow-rap-platinum/10`;
  };

  return (
    <div className={`relative ${getCardHeight()} ${getCardStyling()} ${
      isPending ? 'ring-2 ring-yellow-500/50' : ''
    }`}>
      {/* Background Image */}
      <RankingItemContent
        item={item}
        isTopFive={isTopFive}
        isHot={isHot}
        voteVelocity={voteVelocity}
        rapperImageUrl={rapperImageUrl}
        isPending={isPending}
      />
      
      {/* Position Cap Overlay */}
      <RankingItemPositionCap 
        position={item.dynamic_position} 
        isTopFive={isTopFive} 
        voteCount={item.ranking_votes}
        visualRank={item.visual_rank}
      />
      
      {/* Vote Section Overlay */}
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
        <div className="absolute top-3 right-3 z-30">
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg"></div>
        </div>
      )}
    </div>
  );
};

export default RankingItemCard;
