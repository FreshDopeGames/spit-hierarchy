import React, { useState } from "react";
import { useUserTopRappers } from "@/hooks/useUserTopRappers";
import TopFiveSlot from "./TopFiveSlot";
import RapperSearchOverlay from "./RapperSearchOverlay";

const MyTopFiveSection = () => {
  const { topRappers, isLoading, updateTopRapper, selectedRapperIds } = useUserTopRappers();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

  const handleSlotClick = (position: number) => {
    setSelectedPosition(position);
    setIsSearchOpen(true);
  };

  const handleRapperSelect = (rapperId: string) => {
    if (selectedPosition !== null) {
      updateTopRapper({ position: selectedPosition, rapperId });
      setIsSearchOpen(false);
      setSelectedPosition(null);
    }
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSelectedPosition(null);
  };

  // Create array of 5 positions with current data
  const slots = Array.from({ length: 5 }, (_, index) => {
    const position = index + 1;
    const existingRapper = topRappers.find(item => item.position === position);
    return {
      position,
      rapper: existingRapper?.rappers || null,
    };
  });

  if (isLoading) {
    return (
      <div className="bg-black border border-rap-gold/30 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg shadow-rap-gold/20">
        <div className="animate-pulse">
          <div className="h-6 bg-rap-carbon-light rounded mb-4 w-32 mx-auto"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-rap-carbon-light rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-black border border-rap-gold/30 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg shadow-rap-gold/20">
        <h3 className="text-lg sm:text-xl font-bold text-rap-gold font-merienda mb-4 text-center">
          My Top 5
        </h3>
        
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          {/* Top 2 rappers */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {slots.slice(0, 2).map((slot) => (
              <TopFiveSlot
                key={slot.position}
                position={slot.position}
                rapper={slot.rapper}
                onClick={() => handleSlotClick(slot.position)}
              />
            ))}
          </div>
          {/* Bottom 3 rappers */}
          <div className="grid grid-cols-3 gap-4">
            {slots.slice(2, 5).map((slot) => (
              <TopFiveSlot
                key={slot.position}
                position={slot.position}
                rapper={slot.rapper}
                onClick={() => handleSlotClick(slot.position)}
              />
            ))}
          </div>
        </div>

        {/* Tablet Layout */}
        <div className="hidden sm:block lg:hidden">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {slots.slice(0, 2).map((slot) => (
              <TopFiveSlot
                key={slot.position}
                position={slot.position}
                rapper={slot.rapper}
                onClick={() => handleSlotClick(slot.position)}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {slots.slice(2, 4).map((slot) => (
              <TopFiveSlot
                key={slot.position}
                position={slot.position}
                rapper={slot.rapper}
                onClick={() => handleSlotClick(slot.position)}
              />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4">
            <TopFiveSlot
              position={slots[4].position}
              rapper={slots[4].rapper}
              onClick={() => handleSlotClick(slots[4].position)}
            />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="block sm:hidden">
          <div className="grid grid-cols-1 gap-4">
            {slots.map((slot) => (
              <TopFiveSlot
                key={slot.position}
                position={slot.position}
                rapper={slot.rapper}
                onClick={() => handleSlotClick(slot.position)}
              />
            ))}
          </div>
        </div>
      </div>

      <RapperSearchOverlay
        isOpen={isSearchOpen}
        onClose={handleCloseSearch}
        onSelectRapper={handleRapperSelect}
        excludeIds={selectedRapperIds}
        position={selectedPosition || 1}
      />
    </>
  );
};

export default MyTopFiveSection;
