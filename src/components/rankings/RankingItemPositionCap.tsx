
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
    return "bg-gradient-to-br from-gray-600 via-gray-400 to-gray-300";
  };

  const getRoundedCorners = () => {
    if (isMobile) {
      return "rounded-t-lg"; // Top corners rounded on mobile
    }
    return "rounded-l-lg"; // Left corners rounded on desktop
  };

  if (isMobile) {
    return (
      <div className={`${getPositionGradient(position)} ${getRoundedCorners()} ${isTopFive ? 'h-16' : 'h-8'} flex items-center justify-center`}>
        <span className={`${isTopFive ? 'text-2xl' : 'text-sm'} font-bold text-rap-carbon font-mogra`}>
          {position}
        </span>
      </div>
    );
  }

  return (
    <div className={`${getPositionGradient(position)} ${getRoundedCorners()} ${isTopFive ? 'w-16' : 'w-8'} flex items-center justify-center`}>
      <span className={`${isTopFive ? 'text-2xl' : 'text-sm'} font-bold text-rap-carbon font-mogra`}>
        {position}
      </span>
    </div>
  );
};

export default RankingItemPositionCap;
