
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
      return "bg-rap-carbon/50 border-rap-gold/40 shadow-xl hover:bg-rap-carbon/70 hover:shadow-2xl hover:border-rap-gold/60";
    }
    return "bg-rap-carbon/30 border-rap-platinum/30 hover:bg-rap-carbon/40 hover:border-rap-platinum/40";
  };

  const getCardHeight = () => {
    if (isTopFive) {
      return "min-h-[140px] sm:min-h-[120px]";
    }
    // Reduced height for 6+ rankings on mobile for better fit
    return "h-[60px] sm:h-[78px]";
  };

  const getLayout = () => {
    if (isTopFive && isMobile) {
      return "flex-col";
    }
    return "flex-row";
  };

  const getContentRoundedCorners = () => {
    if (isMobile) {
      return "rounded-b-lg"; // Bottom corners rounded on mobile to match cap's top corners
    }
    return "rounded-r-lg"; // Right corners rounded on desktop to match cap's left corners
  };

  const getContentMargin = () => {
    // On desktop/tablet for top-5, add left margin to account for absolute positioned cap
    if (!isMobile && isTopFive) {
      return "ml-20"; // Match the cap width
    }
    return "";
  };

  // Use consistent border radius for the main container
  const getContainerRadius = () => {
    return "rounded-lg"; // Use lg consistently for both cap and content
  };

  return (
    <div className={`flex ${getLayout()} ${getCardHeight()} border transition-all duration-300 relative ${getCardStyling()} ${
      isPending ? 'ring-2 ring-yellow-500/50 bg-yellow-500/10' : ''
    } overflow-hidden ${getContainerRadius()}`}>
      {/* Position Cap - Absolute positioning for desktop/tablet top-5 to cover full height */}
      <RankingItemPositionCap position={item.dynamic_position} isTopFive={isTopFive} />
      
      {/* Content with appropriate margin for absolute positioned cap */}
      <div className={`flex-1 flex ${isTopFive && isMobile ? 'flex-col' : 'flex-row'} ${getContentRoundedCorners()} ${getContentMargin()}`}>
        <RankingItemContent
          item={item}
          isTopFive={isTopFive}
          isHot={isHot}
          voteVelocity={voteVelocity}
          rapperImageUrl={rapperImageUrl}
          isPending={isPending}
        />
        
        <RankingItemVoteSection
          onVote={onVote}
          userLoggedIn={userLoggedIn}
          isTopFive={isTopFive}
          rankingId={rankingId}
          rapperId={item.rapper?.id}
          rapperName={item.rapper?.name}
          isPending={isPending}
        />
      </div>
      
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
