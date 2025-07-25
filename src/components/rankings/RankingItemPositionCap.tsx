
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface RankingItemPositionCapProps {
  position: number;
  isTopFive: boolean;
  voteCount: number;
  visualRank: number | null;
}

const RankingItemPositionCap = ({ position, isTopFive, voteCount, visualRank }: RankingItemPositionCapProps) => {
  const getPositionGradient = (position: number) => {
    if (position <= 5) {
      return "bg-gradient-to-br from-rap-gold via-rap-gold-light to-yellow-300";
    }
    return "bg-gradient-to-br from-gray-700 via-gray-600 to-gray-500";
  };

  const getPositionStyling = () => {
    if (isTopFive) {
      return "absolute top-4 left-4 z-20 w-16 h-16 md:w-20 md:h-20 rounded-2xl shadow-2xl border-4 border-white/20";
    }
    return "absolute top-3 left-3 z-20 w-12 h-12 rounded-xl shadow-xl border-3 border-white/20";
  };

  const getTextSize = () => {
    if (isTopFive) {
      return "text-2xl md:text-3xl lg:text-4xl";
    }
    return "text-lg md:text-xl";
  };

  // Display logic: show "–" for 0 votes, otherwise show visual rank
  const displayText = voteCount === 0 ? "–" : (visualRank?.toString() || position.toString());

  return (
    <div className={`${getPositionGradient(position)} ${getPositionStyling()} flex items-center justify-center`}>
      <span className={`${getTextSize()} font-bold text-rap-carbon font-mogra drop-shadow-lg`}>
        {displayText}
      </span>
    </div>
  );
};

export default RankingItemPositionCap;
