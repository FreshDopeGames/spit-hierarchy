import React, { useState } from "react";
import { useUserTopRappers } from "@/hooks/useUserTopRappers";
import { useUserProfile } from "@/hooks/useUserProfile";
import TopFiveSlot from "./TopFiveSlot";
import RapperSearchOverlay from "./RapperSearchOverlay";
import ShareTopFiveModal from "./ShareTopFiveModal";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const MyTopFiveSection = () => {
  const {
    topRappers,
    isLoading,
    updateTopRapper,
    swapPositions,
    selectedRapperIds
  } = useUserTopRappers();
  const { userProfile } = useUserProfile();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  const handleSlotClick = (position: number) => {
    setSelectedPosition(position);
    setIsSearchOpen(true);
  };

  const handleRapperSelect = (rapperId: string, rapperData?: { id: string; name: string; image_url: string | null; slug: string }) => {
    if (selectedPosition !== null) {
      updateTopRapper({ position: selectedPosition, rapperId, rapperData });
      setIsSearchOpen(false);
      setSelectedPosition(null);
    }
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSelectedPosition(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const posA = active.id as number;
    const posB = over.id as number;

    // Only swap if both positions have rappers
    const hasA = topRappers.some(item => item.position === posA);
    const hasB = topRappers.some(item => item.position === posB);

    if (hasA && hasB) {
      swapPositions({ posA, posB });
    }
  };

  // Create array of 5 positions with current data
  const slots = Array.from({ length: 5 }, (_, index) => {
    const position = index + 1;
    const existingRapper = topRappers.find(item => item.position === position);
    return {
      position,
      rapper: existingRapper?.rappers || null
    };
  });

  const sortableIds = slots.map(s => s.position);

  if (isLoading) {
    return (
      <div className="bg-black border-4 border-[hsl(var(--theme-primary))] rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg shadow-[hsl(var(--theme-primary))]/20">
        <div className="animate-pulse">
          <div className="h-6 rounded mb-4 w-32 mx-auto bg-rap-carbon/30"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 rounded bg-rap-carbon/30"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div id="my-top-5" className="bg-black border-4 border-[hsl(var(--theme-primary))] rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg shadow-[hsl(var(--theme-primary))]/20">
        <div className="relative mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)] text-center">
            My Top 5
          </h3>
          <Button
            onClick={() => setIsShareOpen(true)}
            variant="outline"
            size="sm"
            className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 border-[hsl(var(--theme-primary))]/30 text-[hsl(var(--theme-primary))] hover:bg-[hsl(var(--theme-primary))] hover:text-black"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <SortableContext items={sortableIds.slice(0, 2)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {slots.slice(0, 2).map(slot => (
                  <TopFiveSlot
                    key={slot.position}
                    position={slot.position}
                    rapper={slot.rapper}
                    onEditClick={() => handleSlotClick(slot.position)}
                  />
                ))}
              </div>
            </SortableContext>
            <SortableContext items={sortableIds.slice(2, 5)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-3 gap-4">
                {slots.slice(2, 5).map(slot => (
                  <TopFiveSlot
                    key={slot.position}
                    position={slot.position}
                    rapper={slot.rapper}
                    onEditClick={() => handleSlotClick(slot.position)}
                  />
                ))}
              </div>
            </SortableContext>
          </div>

          {/* Tablet Layout */}
          <div className="hidden sm:block lg:hidden">
            <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 gap-4 mb-4">
                <TopFiveSlot
                  position={slots[0].position}
                  rapper={slots[0].rapper}
                  onEditClick={() => handleSlotClick(slots[0].position)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {slots.slice(1, 3).map(slot => (
                  <TopFiveSlot
                    key={slot.position}
                    position={slot.position}
                    rapper={slot.rapper}
                    onEditClick={() => handleSlotClick(slot.position)}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {slots.slice(3, 5).map(slot => (
                  <TopFiveSlot
                    key={slot.position}
                    position={slot.position}
                    rapper={slot.rapper}
                    onEditClick={() => handleSlotClick(slot.position)}
                  />
                ))}
              </div>
            </SortableContext>
          </div>

          {/* Mobile Layout */}
          <div className="block sm:hidden">
            <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-1 gap-4">
                {slots.map(slot => (
                  <TopFiveSlot
                    key={slot.position}
                    position={slot.position}
                    rapper={slot.rapper}
                    onEditClick={() => handleSlotClick(slot.position)}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        </DndContext>
      </div>

      <RapperSearchOverlay
        isOpen={isSearchOpen}
        onClose={handleCloseSearch}
        onSelectRapper={handleRapperSelect}
        excludeIds={selectedRapperIds}
        position={selectedPosition || 1}
      />

      <ShareTopFiveModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        slots={slots}
        username={userProfile?.username || "Anonymous"}
      />
    </>
  );
};

export default MyTopFiveSection;
