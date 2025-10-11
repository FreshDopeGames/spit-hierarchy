import React, { useState } from "react";
import { useUserTopRappers } from "@/hooks/useUserTopRappers";
import { useUserProfile } from "@/hooks/useUserProfile";
import TopFiveSlot from "./TopFiveSlot";
import RapperSearchOverlay from "./RapperSearchOverlay";
import ShareTopFiveModal from "./ShareTopFiveModal";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
const MyTopFiveSection = () => {
  const {
    topRappers,
    isLoading,
    updateTopRapper,
    selectedRapperIds
  } = useUserTopRappers();
  const {
    userProfile
  } = useUserProfile();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const handleSlotClick = (position: number) => {
    setSelectedPosition(position);
    setIsSearchOpen(true);
  };
  const handleRapperSelect = (rapperId: string) => {
    if (selectedPosition !== null) {
      updateTopRapper({
        position: selectedPosition,
        rapperId
      });
      setIsSearchOpen(false);
      setSelectedPosition(null);
    }
  };
  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSelectedPosition(null);
  };

  // Create array of 5 positions with current data
  const slots = Array.from({
    length: 5
  }, (_, index) => {
    const position = index + 1;
    const existingRapper = topRappers.find(item => item.position === position);
    return {
      position,
      rapper: existingRapper?.rappers || null
    };
  });
  if (isLoading) {
    return <div className="bg-black border border-rap-gold/30 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg shadow-rap-gold/20">
        <div className="animate-pulse">
          <div className="h-6 rounded mb-4 w-32 mx-auto bg-rap-carbon/30"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({
            length: 5
          }).map((_, i) => <div key={i} className="h-24 rounded bg-rap-carbon/30"></div>)}
          </div>
        </div>
      </div>;
  }
  return <>
      <div className="bg-black border border-rap-gold/30 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg shadow-rap-gold/20">
        <div className="relative mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)] text-center">
            My Top 5
          </h3>
          <Button onClick={() => setIsShareOpen(true)} variant="outline" size="sm" className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 border-rap-gold/30 text-rap-gold hover:bg-rap-gold hover:text-black">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
        
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          {/* Top 2 rappers */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {slots.slice(0, 2).map(slot => <TopFiveSlot key={slot.position} position={slot.position} rapper={slot.rapper} onClick={() => handleSlotClick(slot.position)} />)}
          </div>
          {/* Bottom 3 rappers */}
          <div className="grid grid-cols-3 gap-4">
            {slots.slice(2, 5).map(slot => <TopFiveSlot key={slot.position} position={slot.position} rapper={slot.rapper} onClick={() => handleSlotClick(slot.position)} />)}
          </div>
        </div>

        {/* Tablet Layout */}
        <div className="hidden sm:block lg:hidden">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {slots.slice(0, 2).map(slot => <TopFiveSlot key={slot.position} position={slot.position} rapper={slot.rapper} onClick={() => handleSlotClick(slot.position)} />)}
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {slots.slice(2, 4).map(slot => <TopFiveSlot key={slot.position} position={slot.position} rapper={slot.rapper} onClick={() => handleSlotClick(slot.position)} />)}
          </div>
          <div className="grid grid-cols-1 gap-4">
            <TopFiveSlot position={slots[4].position} rapper={slots[4].rapper} onClick={() => handleSlotClick(slots[4].position)} />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="block sm:hidden">
          <div className="grid grid-cols-1 gap-4">
            {slots.map(slot => <TopFiveSlot key={slot.position} position={slot.position} rapper={slot.rapper} onClick={() => handleSlotClick(slot.position)} />)}
          </div>
        </div>
      </div>

      <RapperSearchOverlay isOpen={isSearchOpen} onClose={handleCloseSearch} onSelectRapper={handleRapperSelect} excludeIds={selectedRapperIds} position={selectedPosition || 1} />

      <ShareTopFiveModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} slots={slots} username={userProfile?.username || "Anonymous"} />
    </>;
};
export default MyTopFiveSection;