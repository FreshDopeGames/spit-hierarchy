
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
  userRankingId?: string;
  rapperImageUrl?: string;
}

const RankingItemCard = ({
  item,
  onVote,
  userLoggedIn,
  hotThreshold,
  rankingId,
  userRankingId,
  rapperImageUrl
}: RankingItemCardProps) => {
  const isMobile = useIsMobile();
  const isHot = item.ranking_votes >= hotThreshold;
  const voteVelocity = isHot ? Math.floor(Math.random() * 15) + 5 : 0;
  const isPending = (item as any).isPending || false;
  const justMoved = (item as any).justMoved || false;
  const isTopFive = (item as any).display_index <= 5;

  const getCardStyling = () => {
    if (isTopFive) {
      return "bg-black border-rap-gold/40 shadow-xl hover:bg-black/90 hover:shadow-2xl hover:border-rap-gold/60";
    }
    return "bg-black border-rap-platinum/30 hover:bg-black/90 hover:border-rap-platinum/40";
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
    // Add consistent spacing for desktop/tablet top-5 to match 6+ rankings spacing
    if (!isMobile && isTopFive) {
      return "ml-3"; // 12px spacing to match the visual spacing of 6+ rankings
    }
    return "";
  };

  // Use consistent border radius for the main container
  const getContainerRadius = () => {
    return "rounded-lg"; // Use lg consistently for both cap and content
  };

  return (
    <div className={`flex ${getLayout()} ${getCardHeight()} border transition-all duration-300 relative ${getCardStyling()} ${
      justMoved ? 'ring-2 ring-rap-gold/70 shadow-lg shadow-rap-gold/30' : ''
    } ${
      isPending && !justMoved ? 'ring-2 ring-yellow-500/50 bg-yellow-500/10' : ''
    } overflow-hidden ${getContainerRadius()}`}>
      {/* Position Cap - Pass vote count and visual rank */}
      <RankingItemPositionCap 
        position={item.dynamic_position} 
        isTopFive={isTopFive} 
        voteCount={item.ranking_votes}
        visualRank={item.visual_rank}
      />
      
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
          userRankingId={userRankingId}
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
