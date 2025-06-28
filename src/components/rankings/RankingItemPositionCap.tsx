
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface RankingItemPositionCapProps {
  position: number;
  isTopFive: boolean;
}

const RankingItemPositionCap = ({ position, isTopFive }: RankingItemPositionCapProps) => {
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
    // On desktop/tablet, all caps match content height with appropriate width
    // On mobile, rankings 6+ get left-side caps (not full width)
    return isTopFive ? 'h-full w-20' : 'h-full w-10';
  };

  return (
    <div className={`${getPositionGradient(position)} ${getRoundedCorners()} ${getSizing()} flex items-center justify-center flex-shrink-0`}>
      <span className={`${isTopFive ? 'text-3xl' : 'text-lg'} font-bold text-rap-carbon font-mogra`}>
        {position}
      </span>
    </div>
  );
};

export default RankingItemPositionCap;
