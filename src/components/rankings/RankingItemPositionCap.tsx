
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
    if (isMobile) {
      return "rounded-t-lg"; // Top corners rounded on mobile
    }
    return "rounded-l-lg"; // Left corners rounded on desktop
  };

  const getSizing = () => {
    if (isMobile) {
      return isTopFive ? 'h-20 w-full' : 'h-10 w-full';
    }
    return isTopFive ? 'w-20 h-full' : 'w-10 h-full';
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
