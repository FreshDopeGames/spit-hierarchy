
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface RankingItemPositionCapProps {
  position: number;
  isTopFive: boolean;
  voteCount: number;
  visualRank: number | null;
}

const RankingItemPositionCap = ({ position, isTopFive, voteCount, visualRank }: RankingItemPositionCapProps) => {
  const isMobile = useIsMobile();

  const getPositionGradient = (position: number) => {
    if (position <= 5) {
      return "bg-gradient-to-br from-rap-gold-dark via-rap-gold to-rap-gold-light";
    }
    return "bg-gradient-to-br from-gray-600 via-gray-500 to-gray-400";
  };

  const getRoundedCorners = () => {
    if (isMobile && isTopFive) {
      return "rounded-t-lg"; // Top corners rounded on mobile for top 5
    }
    return "rounded-l-lg"; // Left corners rounded for desktop top 5 and all 6+ rankings
  };

  const getSizing = () => {
    if (isMobile && isTopFive) {
      return 'h-10 w-full'; // Half height, full width for mobile top 5
    }
    // On desktop/tablet, ensure the cap covers the full height including padding
    // Use absolute positioning to stretch the full height of the parent container
    if (isTopFive) {
      return 'absolute left-0 top-0 bottom-0 w-20'; // Absolute positioning to cover full height
    }
    return 'h-full w-10'; // For 6+ rankings, keep existing behavior
  };

  const getPositioning = () => {
    if (!isMobile && isTopFive) {
      return 'relative'; // Make parent relative for absolute positioning
    }
    return '';
  };

  // Display logic: show "–" for 0 votes, otherwise show visual rank
  const displayText = voteCount === 0 ? "–" : (visualRank?.toString() || position.toString());

  return (
    <div className={`${getPositionGradient(position)} ${getRoundedCorners()} ${getSizing()} flex items-center justify-center flex-shrink-0 ${getPositioning()}`}>
      <span className={`${isTopFive ? 'text-3xl' : 'text-lg'} font-bold text-rap-carbon font-mogra relative z-10`}>
        {displayText}
      </span>
    </div>
  );
};

export default RankingItemPositionCap;
