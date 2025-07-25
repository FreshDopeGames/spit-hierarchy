
import React from "react";
import { Music } from "lucide-react";

interface TopFiveSlotProps {
  position: number;
  rapper: {
    id: string;
    name: string;
    image_url: string | null;
  } | null;
  onClick: () => void;
}

const TopFiveSlot = ({ position, rapper, onClick }: TopFiveSlotProps) => {
  return (
    <div
      onClick={onClick}
      className="bg-rap-carbon/30 border border-rap-gold/20 rounded-lg p-3 cursor-pointer hover:border-rap-gold/50 transition-colors group"
    >
      <div className="flex flex-col items-center space-y-2">
        <div className="text-xs text-rap-gold font-merienda font-bold">
          #{position}
        </div>
        
        {rapper ? (
          <>
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-rap-carbon to-rap-carbon-light border border-rap-gold/30">
              {rapper.image_url ? (
                <img 
                  src={rapper.image_url} 
                  alt={rapper.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-6 h-6 text-rap-platinum/50" />
                </div>
              )}
            </div>
            <div className="text-xs text-rap-platinum font-merienda text-center line-clamp-2">
              {rapper.name}
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-rap-carbon-light border-2 border-dashed border-rap-gold/30 flex items-center justify-center group-hover:border-rap-gold/50">
              <Music className="w-6 h-6 text-rap-platinum/30" />
            </div>
            <div className="text-xs text-rap-smoke font-merienda text-center">
              Click to add rapper
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TopFiveSlot;
