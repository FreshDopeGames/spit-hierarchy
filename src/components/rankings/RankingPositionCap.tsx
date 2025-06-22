
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface RankingPositionCapProps {
  position: number;
}

const RankingPositionCap = ({ position }: RankingPositionCapProps) => {
  const isMobile = useIsMobile();

  // Helper function to get gradient classes based on position
  const getPositionGradient = (position: number) => {
    if (position <= 5) {
      return "bg-gradient-to-br from-rap-gold-dark via-rap-gold to-rap-gold-light";
    }
    return "bg-gradient-to-br from-gray-600 via-gray-400 to-gray-300";
  };

  if (isMobile) {
    return (
      <div className={`${getPositionGradient(position)} h-16 flex items-center justify-center rounded-t-lg`}>
        <span className="text-2xl font-bold text-rap-carbon font-mogra">
          {position}
        </span>
      </div>
    );
  }

  return (
    <div className={`${getPositionGradient(position)} w-16 flex items-center justify-center rounded-l-lg`}>
      <span className="text-2xl font-bold text-rap-carbon font-mogra">
        {position}
      </span>
    </div>
  );
};

export default RankingPositionCap;
